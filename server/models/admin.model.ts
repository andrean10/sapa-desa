import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Enums } from '../../shared/types/database.types'

export type AkunBaru = { username: string; nama_tampil: string; peran: Enums<'peran_pengguna'>; kantor_id: string | null; password: string }

export async function daftarAkunAdmin(client: SupabaseClient<Database>) {
  return client.from('profiles').select('id, username, nama_tampil, peran, kantor_id, aktif').order('username')
}

export async function daftarKantorAdmin(client: SupabaseClient<Database>) {
  return client.from('kantor_imigrasi').select('id, nama, aktif').order('nama')
}

export async function buatAkunAdmin(service: SupabaseClient<Database>, input: AkunBaru, domain: string) {
  if (input.peran === 'upt' && input.kantor_id) {
    const akunKantor = await service.from('profiles').select('id').eq('peran', 'upt').eq('kantor_id', input.kantor_id).limit(1).maybeSingle()
    if (akunKantor.error) return { error: akunKantor.error, data: null }
    if (akunKantor.data) return { error: new Error('Akun UPT untuk kantor tersebut sudah tersedia.'), data: null }
  }
  const email = `${input.username}@${domain}`
  const hasil = await service.auth.admin.createUser({ email, password: input.password, email_confirm: true })
  if (hasil.error || !hasil.data.user) return { error: hasil.error ?? new Error('Akun autentikasi gagal dibuat.'), data: null }
  const profil = await service.from('profiles').insert({ id: hasil.data.user.id, username: input.username, nama_tampil: input.nama_tampil, peran: input.peran, kantor_id: input.kantor_id })
  if (profil.error) {
    await service.auth.admin.deleteUser(hasil.data.user.id)
    return { error: profil.error, data: null }
  }
  return { error: null, data: { id: hasil.data.user.id } }
}

export async function resetPasswordAkunAdmin(service: SupabaseClient<Database>, id: string, password: string) {
  return service.auth.admin.updateUserById(id, { password })
}

export async function ubahAkunAktifAdmin(service: SupabaseClient<Database>, id: string, aktif: boolean) {
  const hasil = await service.from('profiles').update({ aktif }).eq('id', id).select('id').maybeSingle()
  if (hasil.error || !hasil.data) return hasil
  const auth = await service.auth.admin.updateUserById(id, { ban_duration: aktif ? 'none' : '876000h' })
  if (auth.error) {
    await service.from('profiles').update({ aktif: !aktif }).eq('id', id)
    return { ...hasil, error: auth.error, data: null }
  }
  return hasil
}

export async function linkImpersonasiAdmin(service: SupabaseClient<Database>, email: string, redirectTo: string) {
  return service.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo } })
}

/** True bila akun ini adalah admin aktif terakhir. Gagal aman: jika query error, anggap terakhir. */
export async function apakahAdminAktifTerakhir(service: SupabaseClient<Database>, id: string) {
  const { data } = await service.from('profiles').select('peran, aktif').eq('id', id).maybeSingle()
  if (data?.peran !== 'admin' || !data.aktif) return false
  const { count, error } = await service
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('peran', 'admin')
    .eq('aktif', true)
    .neq('id', id)
  if (error) return true
  return (count ?? 0) === 0
}
