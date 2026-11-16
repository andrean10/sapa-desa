import type { Tables } from './database.types'

export type ProfilAkun = Pick<
  Tables<'profiles'>,
  'id' | 'username' | 'nama_tampil' | 'peran' | 'kantor_id' | 'aktif'
>
export type PegawaiPilihan = Pick<Tables<'pegawai'>, 'id' | 'nama'>
