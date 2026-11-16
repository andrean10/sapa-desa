import { randomUUID } from 'node:crypto'
import type { Tables, TablesInsert } from '../../shared/types/database.types'
import type { LaporanBaru } from '../../shared/types/laporan'
import { buatClientAnonimo, buatClientServiceRole } from '../utils/supabase'

export type KabupatenPublik = Pick<Tables<'kabupaten'>, 'id' | 'nama' | 'jenis' | 'kantor_id'>
export type KecamatanPublik = Pick<Tables<'kecamatan'>, 'id' | 'nama'>
export type DesaPublik = Pick<Tables<'desa_kelurahan'>, 'id' | 'nama' | 'jenis_wilayah'>
export type FaqPublik = Pick<Tables<'faq'>, 'id' | 'pertanyaan' | 'jawaban'>

export async function ambilKabupatenPublik() {
  return buatClientAnonimo()
    .from('kabupaten')
    .select('id, nama, jenis, kantor_id')
    .order('nama')
}

export async function ambilKecamatanPublik(kabupatenId: string) {
  return buatClientAnonimo()
    .from('kecamatan')
    .select('id, nama')
    .eq('kabupaten_id', kabupatenId)
    .order('nama')
}

export async function ambilDesaPublik(kecamatanId: string) {
  return buatClientAnonimo()
    .from('desa_kelurahan')
    .select('id, nama, jenis_wilayah')
    .eq('kecamatan_id', kecamatanId)
    .order('nama')
}

export async function ambilFaqPublik() {
  return buatClientAnonimo()
    .from('faq')
    .select('id, pertanyaan, jawaban')
    .order('urutan')
}

export async function simpanFotoLaporan(file: Uint8Array, tipe: string, ekstensi: string) {
  const path = `${randomUUID()}.${ekstensi}`
  const hasil = await buatClientServiceRole()
    .storage
    .from('foto-laporan')
    .upload(path, file, { contentType: tipe, upsert: false })

  return hasil.error ? { error: hasil.error } : { path }
}

export async function hapusFotoLaporan(path: string) {
  return buatClientServiceRole().storage.from('foto-laporan').remove([path])
}

export async function cariLaporanSebelumnya(kode: string) {
  return buatClientServiceRole()
    .from('laporan')
    .select('id')
    .eq('kode_pelacakan', kode)
    .maybeSingle()
}

export async function lacakLaporanPublik(kode: string) {
  return buatClientAnonimo().rpc('lacak_laporan', { p_kode: kode })
}

export async function simpanLaporan(input: LaporanBaru) {
  return buatClientServiceRole()
    .from('laporan')
    .insert(input as TablesInsert<'laporan'>)
    .select('kode_pelacakan')
    .single()
}
