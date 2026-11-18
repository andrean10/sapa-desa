import type { PegawaiPilihan } from '~~/shared/types/auth'
import type { Tables } from '~~/shared/types/database.types'

export type PegawaiUpt = PegawaiPilihan & Pick<Tables<'pegawai'>, 'nip' | 'aktif'> & { desa_binaan: string[] }

export function usePegawaiUpt() {
  const api = useApi()
  function daftar() { return useAsyncData<PegawaiUpt[]>('upt-pegawai', () => api('/api/upt/pegawai'), { default: () => [], lazy: true }) }
  async function tambah(nama: string, nip: string) {
    return await api<PegawaiUpt>('/api/upt/pegawai', { method: 'POST', body: { nama, nip } })
  }
  async function ubah(id: string, perubahan: Partial<Pick<PegawaiUpt, 'nama' | 'nip' | 'aktif'>>) {
    return await api<PegawaiUpt>(`/api/upt/pegawai/${id}`, { method: 'PATCH', body: perubahan })
  }
  return { daftar, tambah, ubah }
}
