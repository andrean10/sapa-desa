import { createError, getRequestIP, setResponseHeader, type H3Event } from 'h3'

type CatatanBatas = { jumlah: number; berakhirPada: number }

const catatanPerIp = new Map<string, CatatanBatas>()
const JENDELA_MS = 15 * 60 * 1000
const MAKSIMUM_KUNCI = 10000

function batasi(event: H3Event, jalur: string, batas: number) {
  // Aplikasi berjalan di belakang reverse proxy (Coolify/Traefik), jadi IP socket adalah IP proxy.
  // Ambil IP klien dari X-Forwarded-For yang diisi proxy. Syaratnya: server Nuxt tidak boleh
  // bisa diakses langsung dari internet tanpa melewati proxy, kalau tidak header ini bisa dipalsukan.
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'ip-tidak-diketahui'
  const kunci = `${jalur}:${ip}`
  const sekarang = Date.now()

  for (const [alamatIp, catatan] of catatanPerIp) {
    if (catatan.berakhirPada <= sekarang) catatanPerIp.delete(alamatIp)
  }

  const catatan = catatanPerIp.get(kunci)
  if (!catatan || catatan.berakhirPada <= sekarang) {
    if (catatanPerIp.size >= MAKSIMUM_KUNCI) {
      const kunciTerlama = catatanPerIp.keys().next().value
      if (kunciTerlama) catatanPerIp.delete(kunciTerlama)
    }
    catatanPerIp.set(kunci, { jumlah: 1, berakhirPada: sekarang + JENDELA_MS })
    return
  }

  if (catatan.jumlah >= batas) {
    const sisaDetik = Math.max(1, Math.ceil((catatan.berakhirPada - sekarang) / 1000))
    setResponseHeader(event, 'Retry-After', sisaDetik)
    throw createError({
      statusCode: 429,
      statusMessage: 'Batas permintaan tercapai. Silakan coba lagi nanti.'
    })
  }

  catatan.jumlah += 1
}

/** Fixed-window limiter per IP untuk satu proses server Nuxt. */
export function batasiKirimLaporan(event: H3Event) {
  batasi(event, 'kirim-laporan', 5)
}

export function batasiLacakLaporan(event: H3Event) {
  batasi(event, 'lacak-laporan', 20)
}
