type KegiatanUpt = {
  id: string
  tanggal_kegiatan: string
  desa_id: string
  pegawai_id: string
  jenis_kegiatan_id: string
  jumlah_peserta: number
  uraian_hasil: string
  petugas_pengganti_nama: string | null
  created_at: string
  foto_paths: string[]
  pdf_path: string | null
  desa: string
  jenis: string
  pegawai: string
}
type OpsiKegiatanUpt = {
  desa: { desa_id: string; desa: string; kecamatan: string }[]
  pegawai: { id: string; nama: string }[]
  jenis: { id: string; nama: string }[]
  penugasan: { pegawai_id: string; desa_id: string; tanggal_mulai: string; tanggal_selesai: string | null }[]
}

export type DetailKegiatanUpt = Pick<KegiatanUpt, 'id' | 'tanggal_kegiatan' | 'desa_id' | 'pegawai_id' | 'jenis_kegiatan_id' | 'jumlah_peserta' | 'uraian_hasil' | 'foto_paths' | 'pdf_path' | 'petugas_pengganti_nama'> & { foto_urls: string[]; pdf_url: string | null }

export function useKegiatanUpt() {
  const api = useApi()
  function daftar() { return useAsyncData<{ data: KegiatanUpt[]; batas_menit_hapus: number }>('upt-kegiatan', () => api<{ data: KegiatanUpt[]; batas_menit_hapus: number }>('/api/upt/kegiatan'), { default: () => ({ data: [], batas_menit_hapus: 10 }), lazy: true }) }
  async function opsi() { return await api<OpsiKegiatanUpt>('/api/upt/kegiatan/opsi') }
  async function detail(id: string) { return await api<DetailKegiatanUpt>(`/api/upt/kegiatan/${id}`) }
  async function buat(input: { tanggal_kegiatan: string; desa_id: string; pegawai_id: string; petugas_pengganti_nama?: string; jenis_kegiatan_id: string; jumlah_peserta: number; uraian_hasil: string; foto_paths?: string[]; pdf_path?: string }) {
    return await api('/api/upt/kegiatan', { method: 'POST', body: input })
  }
  function unggah(file: File, jenis: 'foto' | 'pdf', progres?: (persen: number) => void) {
    const form = new FormData()
    form.append('jenis', jenis)
    form.append('file', file)
    return new Promise<{ path: string }>((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open('POST', '/api/upt/kegiatan/unggah')
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) progres?.(Math.round(event.loaded / event.total * 100))
      }
      request.onerror = () => reject(new Error('Koneksi terputus saat mengunggah lampiran.'))
      request.onload = () => {
        let hasil: { path?: string; statusMessage?: string } = {}
        try { hasil = JSON.parse(request.responseText) as typeof hasil } catch { /* response non-JSON is handled below */ }
        if (request.status >= 200 && request.status < 300 && hasil.path) resolve({ path: hasil.path })
        else reject(Object.assign(new Error(hasil.statusMessage ?? 'Lampiran belum dapat diunggah.'), { data: { statusMessage: hasil.statusMessage } }))
      }
      request.send(form)
    })
  }
  async function bersihkan(lampiran: { foto_paths?: string[]; pdf_path?: string }) {
    return await api('/api/upt/kegiatan/bersihkan', { method: 'POST', body: lampiran })
  }
  async function hapus(id: string) { return await api(`/api/upt/kegiatan/${id}`, { method: 'DELETE' }) }
  async function ubah(id: string, input: { tanggal_kegiatan: string; pegawai_id: string; petugas_pengganti_nama?: string; jenis_kegiatan_id: string; jumlah_peserta: number; uraian_hasil: string; foto_paths?: string[]; pdf_path?: string }) {
    return await api(`/api/upt/kegiatan/${id}`, { method: 'PATCH', body: input })
  }
  return { daftar, opsi, detail, buat, unggah, bersihkan, ubah, hapus }
}
