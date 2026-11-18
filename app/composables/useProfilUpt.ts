import type { Tables } from '~~/shared/types/database.types'

type ProfilKantorUptResponse = {
  username: string
  kantor: Pick<Tables<'kantor_imigrasi'>, 'id' | 'nama' | 'nama_singkat'>
  kabupaten: Pick<Tables<'kabupaten'>, 'id' | 'nama' | 'jenis'>[]
  pimpasa: (Pick<Tables<'desa_binaan_pegawai'>, 'pegawai_id' | 'desa_id' | 'tanggal_mulai'> & { pegawai: string; desa: string; kecamatan: string; kabupaten: string })[]
}

export function useProfilUpt() {
  const api = useApi()
  return useAsyncData<ProfilKantorUptResponse>('upt-profil-kantor', () => api<ProfilKantorUptResponse>('/api/upt/profil'), { lazy: true })
}
