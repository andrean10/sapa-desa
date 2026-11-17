import { TIMEZONE } from '../config/app'

type BagianWaktu = Record<Intl.DateTimeFormatPartTypes, string>

function bagianTanggal(instant: Date): BagianWaktu {
  if (Number.isNaN(instant.getTime())) throw new RangeError('Tanggal tidak valid.')

  const bagian = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(instant)

  return Object.fromEntries(bagian.map(item => [item.type, item.value])) as BagianWaktu
}

function jadikanTanggal(nilai: Date | string): Date {
  return nilai instanceof Date ? nilai : new Date(nilai)
}

export function formatTanggalWaktuWib(nilai: Date | string): string {
  const bagian = bagianTanggal(jadikanTanggal(nilai))
  return `${bagian.day} ${bagian.month} ${bagian.year}, ${bagian.hour}.${bagian.minute} WIB`
}

export function formatTanggalWib(nilai: Date | string): string {
  const bagian = bagianTanggal(jadikanTanggal(nilai))
  return `${bagian.day} ${bagian.month} ${bagian.year}`
}

export function tanggalHariIniWib(sekarang: Date = new Date()): string {
  bagianTanggal(sekarang)
  const bagianNumerik = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(sekarang)
  const nilai = Object.fromEntries(bagianNumerik.map(item => [item.type, item.value]))
  return `${nilai.year}-${nilai.month}-${nilai.day}`
}

/** Tanggal awal rentang "6 bulan" (bulan berjalan + 5 bulan sebelumnya), format YYYY-MM-DD, memakai kalender WIB. */
export function awalEnamBulanWib(hariIni: string = tanggalHariIniWib()): string {
  const tahun = Number(hariIni.slice(0, 4))
  const bulan = Number(hariIni.slice(5, 7))
  return new Date(Date.UTC(tahun, bulan - 6, 1)).toISOString().slice(0, 10)
}

/** Nama bulan singkat (mis. "Nov") untuk sumbu grafik; nilai berupa epoch milidetik. */
export function formatBulanSingkatWib(nilai: number): string {
  return new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: TIMEZONE }).format(new Date(nilai))
}

export type ModePeriode = 'bulan_ini' | 'bulan_lalu' | 'tahun_ini' | 'enam_bulan' | 'kustom'
export type RentangTanggal = { mulai: string; selesai: string }

function batasBulanWib(hariIni: string, geser: number): RentangTanggal {
  const tahun = Number(hariIni.slice(0, 4))
  const bulan = Number(hariIni.slice(5, 7))
  const awal = new Date(Date.UTC(tahun, bulan - 1 + geser, 1))
  const akhir = new Date(Date.UTC(awal.getUTCFullYear(), awal.getUTCMonth() + 1, 0))
  return { mulai: awal.toISOString().slice(0, 10), selesai: geser === 0 ? hariIni : akhir.toISOString().slice(0, 10) }
}

/** Rentang tanggal (YYYY-MM-DD, kalender WIB) untuk pemilih periode dashboard dan peringkat. */
export function rentangPeriode(mode: ModePeriode, kustom: RentangTanggal, hariIni: string = tanggalHariIniWib()): RentangTanggal {
  if (mode === 'bulan_ini') return batasBulanWib(hariIni, 0)
  if (mode === 'bulan_lalu') return batasBulanWib(hariIni, -1)
  if (mode === 'tahun_ini') return { mulai: `${hariIni.slice(0, 4)}-01-01`, selesai: hariIni }
  if (mode === 'enam_bulan') return { mulai: awalEnamBulanWib(hariIni), selesai: hariIni }
  return { mulai: kustom.mulai, selesai: kustom.selesai }
}

/** Waktu relatif singkat ("3 hari lalu"). Selalu tampilkan bersama tooltip tanggal lengkap. */
export function formatRelatifWib(nilai: Date | string, sekarang: Date = new Date()): string {
  const instant = jadikanTanggal(nilai)
  bagianTanggal(instant)
  const selisihMenit = Math.floor((sekarang.getTime() - instant.getTime()) / 60_000)
  if (selisihMenit < 1) return 'Baru saja'
  if (selisihMenit < 60) return `${selisihMenit} menit lalu`
  if (selisihMenit < 60 * 24 && tanggalHariIniWib(instant) === tanggalHariIniWib(sekarang)) return `${Math.floor(selisihMenit / 60)} jam lalu`
  const hari = Math.round((Date.parse(tanggalHariIniWib(sekarang)) - Date.parse(tanggalHariIniWib(instant))) / 86_400_000)
  if (hari <= 1) return 'Kemarin'
  if (hari < 30) return `${hari} hari lalu`
  if (hari < 365) return `${Math.floor(hari / 30)} bulan lalu`
  return `${Math.floor(hari / 365)} tahun lalu`
}
