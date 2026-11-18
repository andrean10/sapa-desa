import type { Database, Enums, Json } from '~~/shared/types/database.types'

export type RingkasanKanwil = Database['public']['Functions']['dashboard_kanwil_ringkasan']['Returns'][number]
export type BarisUptKanwil = Database['public']['Functions']['dashboard_kanwil_per_upt']['Returns'][number]
export type PeringkatUpt = Database['public']['Functions']['peringkat_upt']['Returns'][number]
export type PeringkatKecamatan = Database['public']['Functions']['peringkat_kecamatan']['Returns'][number]
export type PeringkatDesa = Database['public']['Functions']['peringkat_desa']['Returns'][number]
export type PantauanLaporan = Database['public']['Views']['v_laporan_belum_ditanggapi']['Row']
export type TrenKanwil = {
  periode?: { mulai: string; selesai: string }
  laporan_per_bulan?: { bulan: string; total: number; wna: number; wni: number }[]
  kegiatan_per_bulan?: { bulan: string; total: number }[]
  proporsi?: { wna: number; wni: number }
  kegiatan_per_jenis?: { jenis: string; jumlah: number }[]
}
export type DataPeringkat = { upt: PeringkatUpt[]; kecamatan: PeringkatKecamatan[]; desa: PeringkatDesa[] }

export function useDashboardKanwil(periode: MaybeRefOrGetter<{ mulai?: string; selesai?: string }> = {}) {
  const api = useApi()
  return useAsyncData('dashboard-kanwil', async () => await api<{
    ringkasan: RingkasanKanwil | null
    perUpt: BarisUptKanwil[]
    tren: Json
    pantauan: PantauanLaporan[]
  }>('/api/kanwil/dashboard', { query: toValue(periode) }), {
    lazy: true,
    watch: [() => toValue(periode)],
    default: () => ({ ringkasan: null, perUpt: [], tren: null, pantauan: [] })
  })
}

export function usePeringkatKanwil(periode: MaybeRefOrGetter<{ mulai?: string; selesai?: string; hanyaNonDbi?: boolean }> = {}) {
  const api = useApi()
  return useAsyncData<DataPeringkat>('peringkat-kanwil', async () => await api<DataPeringkat>('/api/kanwil/peringkat', { query: toValue(periode) }), {
    lazy: true,
    watch: [() => toValue(periode)],
    default: () => ({ upt: [], kecamatan: [], desa: [] })
  })
}

export function usePantauanKanwil(kantorId: MaybeRefOrGetter<string> = '') {
  const api = useApi()
  return useAsyncData<{ data: PantauanLaporan[]; kantor: { id: string; nama: string; nama_singkat: string }[]; batasHari: number }>(
    'pantauan-kanwil', async () => await api('/api/kanwil/pantauan', { query: { kantorId: toValue(kantorId) || undefined } }),
    { lazy: true, watch: [() => toValue(kantorId)], default: () => ({ data: [], kantor: [], batasHari: 7 }) }
  )
}

export function useDaftarLaporanKanwil(halaman: MaybeRefOrGetter<number>, kantorId: MaybeRefOrGetter<string>, filter: MaybeRefOrGetter<{ status: string[]; jenis: string; dari: string; sampai: string; cari: string; terlambat: boolean }>) {
  const api = useApi()
  return useAsyncData(`laporan-kanwil-${toValue(halaman)}-${toValue(kantorId)}`, () => api<{ data: { id: string; kode_pelacakan: string; status: Enums<'status_laporan'>; jenis_terlapor: Enums<'jenis_terlapor'>; created_at: string; desa: string; kecamatan: string; kantor: string }[]; total: number; halaman: number; kantor: { id: string; nama: string; nama_singkat: string }[] }>('/api/kanwil/laporan', { query: { halaman: toValue(halaman), kantorId: toValue(kantorId) || undefined, ...Object.fromEntries(Object.entries(toValue(filter)).filter(([, value]) => value !== '' && value !== false && !(Array.isArray(value) && value.length === 0))) } }), { lazy: true, watch: [() => toValue(halaman), () => toValue(kantorId), () => JSON.stringify(toValue(filter))], default: () => ({ data: [], total: 0, halaman: 1, kantor: [] }) })
}

export function useDaftarKegiatanKanwil(halaman: MaybeRefOrGetter<number>, kantorId: MaybeRefOrGetter<string>, filter: MaybeRefOrGetter<{ hanyaDiganti: boolean; dari: string; sampai: string; desaId: string; jenisId: string; pegawaiId: string }>) {
  const api = useApi()
  return useAsyncData(`kegiatan-kanwil-${toValue(halaman)}-${toValue(kantorId)}`, () => api<{ data: { id: string; tanggal_kegiatan: string; kantor: string; desa: string; pegawai: string; jenis: string; jumlah_peserta: number; petugas_pengganti: boolean; ada_foto: boolean; ada_pdf: boolean }[]; total: number; halaman: number; kantor: { id: string; nama: string; nama_singkat: string }[]; pilihan: { desa: { id: string; nama: string }[]; pegawai: { id: string; nama: string }[]; jenis: { id: string; nama: string }[] } }>('/api/kanwil/kegiatan', { query: { halaman: toValue(halaman), kantorId: toValue(kantorId) || undefined, ...Object.fromEntries(Object.entries(toValue(filter)).filter(([, value]) => value !== '' && value !== false)) } }), { lazy: true, watch: [() => toValue(halaman), () => toValue(kantorId), () => JSON.stringify(toValue(filter))], default: () => ({ data: [], total: 0, halaman: 1, kantor: [], pilihan: { desa: [], pegawai: [], jenis: [] } }) })
}
