import type { Database } from '~~/shared/types/database.types'

type InputPenugasan = { desa_id: string; pegawai_id: string; tanggal_mulai?: string }
type PerubahanPenugasan = { tanggal_mulai?: string; tanggal_selesai?: string | null; alasan_berakhir?: Database['public']['Enums']['alasan_berakhir_penugasan'] | null }
type InputFaq = { id?: string; pertanyaan: string; jawaban: string; urutan: number }

export function useKelolaKanwil() {
  const api = useApi()
  return {
    daftarDesa: () => api<{
      id: string; nama: string; kecamatan: string; kabupaten: string; kantor: string; petugas: string[]; penugasanAktif: number; kegiatanTerakhir: string | null
    }[]>('/api/kanwil/desa-binaan'),
    pilihanWilayah: (query: { kabupatenId?: string; kecamatanId?: string }) => api<{
      kabupaten: { id: string; nama: string; jenis: string }[]
      kecamatan: { id: string; nama: string }[]
      desa: { id: string; nama: string; jenis_wilayah: Database['public']['Enums']['jenis_wilayah_desa']; dbi: boolean }[]
    }>('/api/kanwil/desa-binaan/pilihan', { query }),
    ubahDbi: (desa_id: string, dbi: boolean) => api<{ jumlahPenugasanDitutup: number | null }>('/api/kanwil/desa-binaan/status', { method: 'PATCH', body: { desa_id, dbi } }),
    daftarPenugasan: (query: { aktif?: string; kantorId?: string; desaId?: string; pegawaiId?: string }) => api<{
      data: { id: string; desa_id: string; pegawai_id: string; kantor_id: string; desa: string; pegawai: string; kantor: string; tanggal_mulai: string; tanggal_selesai: string | null; alasan_berakhir: Database['public']['Enums']['alasan_berakhir_penugasan'] | null }[]
      kantor: { id: string; nama: string; nama_singkat: string }[]
    }>('/api/kanwil/penugasan', { query }),
    pilihanPenugasan: () => api<{
      desa: { id: string; nama: string; kecamatan: string; kabupaten: string; kantor_id: string; kantor: string }[]
      pegawai: { id: string; nama: string; kantor_id: string; kantor: string }[]
      kantor: { id: string; nama_singkat: string }[]
      error: null
    }>('/api/kanwil/penugasan/opsi'),
    buatPenugasan: (body: InputPenugasan) => api<{ id: string }>('/api/kanwil/penugasan', { method: 'POST', body }),
    ubahPenugasan: (id: string, body: PerubahanPenugasan) => api<{ berhasil: true }>(`/api/kanwil/penugasan/${id}`, { method: 'PATCH', body }),
    daftarWilayah: () => api<{
      kabupaten: { id: string; nama: string; jenis: Database['public']['Enums']['jenis_daerah']; kantor_id: string; kantor: string; jumlahPenugasanAktif: number }[]
      kantor: { id: string; nama: string; nama_singkat: string }[]
    }>('/api/kanwil/wilayah-kerja'),
    ubahWilayah: (kabupaten_id: string, kantor_id: string) => api<{ jumlahPenugasanDitutup: number }>('/api/kanwil/wilayah-kerja', { method: 'PATCH', body: { kabupaten_id, kantor_id } }),
    daftarFaq: () => api<{ id: string; pertanyaan: string; jawaban: string; urutan: number }[]>('/api/kanwil/faq'),
    simpanFaq: (body: InputFaq) => api<{ berhasil: true }>(body.id ? `/api/kanwil/faq/${body.id}` : '/api/kanwil/faq', { method: body.id ? 'PATCH' : 'POST', body }),
    hapusFaq: (id: string) => api<{ berhasil: true }>(`/api/kanwil/faq/${id}`, { method: 'DELETE' }),
    ubahUrutanFaq: (id: string, urutan: number) => api<{ berhasil: true }>(`/api/kanwil/faq/${id}/urutan`, { method: 'PATCH', body: { urutan } }),
    daftarPengaturan: () => api<{
      pengaturan: { kunci: string; nilai: string; keterangan: string | null }[]
      jenis: { id: string; nama: string; aktif: boolean }[]
    }>('/api/kanwil/pengaturan'),
    simpanPengaturan: (kunci: string, nilai: number) => api<{ berhasil: true }>('/api/kanwil/pengaturan', { method: 'PATCH', body: { kunci, nilai } }),
    simpanJenis: (body: { id?: string; nama: string; aktif?: boolean }) => api<{ berhasil: true }>(body.id ? `/api/kanwil/jenis-kegiatan/${body.id}` : '/api/kanwil/jenis-kegiatan', { method: body.id ? 'PATCH' : 'POST', body })
  }
}
