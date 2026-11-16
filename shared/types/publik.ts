import type { Tables } from './database.types'

export type FaqPublik = Pick<Tables<'faq'>, 'id' | 'pertanyaan' | 'jawaban'>
export type KabupatenPublik = Pick<Tables<'kabupaten'>, 'id' | 'nama' | 'jenis' | 'kantor_id'>
export type KecamatanPublik = Pick<Tables<'kecamatan'>, 'id' | 'nama'>
export type DesaPublik = Pick<Tables<'desa_kelurahan'>, 'id' | 'nama' | 'jenis_wilayah'>
