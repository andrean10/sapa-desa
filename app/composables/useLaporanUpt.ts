import type { Tables } from '~~/shared/types/database.types'

type LaporanUptRingkas = Pick<Tables<'laporan'>, 'id' | 'kode_pelacakan' | 'status' | 'jenis_terlapor' | 'created_at' | 'desa_kelurahan_id'> & { desa: string; kecamatan: string }
type LaporanUptDetail = Omit<Tables<'laporan'>, 'foto_path'> & {
  foto_url: string | null
  lokasi: { desa: string | null; kecamatan: string | null; kabupaten: string | null }
  kantor: string | null
  laporan_sebelumnya: Pick<Tables<'laporan'>, 'id' | 'kode_pelacakan'> | null
  riwayat_status: (Pick<Tables<'riwayat_status'>, 'id' | 'status' | 'keterangan' | 'created_at' | 'pegawai_id'> & { nama_pegawai: string | null })[]
}

export function useLaporanUpt() {
  const api = useApi()
  function daftar(halaman: MaybeRefOrGetter<number>, filter: MaybeRefOrGetter<{ status: string[]; kelompok: string; terlambat: boolean; jenis: string; dari: string; sampai: string; cari: string; urut: string }>) {
    return useAsyncData<{ data: LaporanUptRingkas[]; total: number; halaman: number }>(`upt-laporan-${toValue(halaman)}`, () => api('/api/upt/laporan', {
      query: { halaman: toValue(halaman), ...Object.fromEntries(Object.entries(toValue(filter)).filter(entry => entry[1] !== '' && entry[1] !== false)) }
    }), {
      watch: [() => toValue(halaman), () => toValue(filter)],
      default: () => ({ data: [] as LaporanUptRingkas[], total: 0, halaman: 1 })
    })
  }

  async function detail(id: string) {
    return await api<LaporanUptDetail>(`/api/upt/laporan/${id}`)
  }

  async function ubahStatus(id: string, status: string, keterangan: string) {
    return await api(`/api/upt/laporan/${id}/status`, { method: 'POST', body: { status, keterangan } })
  }

  return { daftar, detail, ubahStatus }
}
