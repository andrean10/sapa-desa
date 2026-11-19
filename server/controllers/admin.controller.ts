import { createError, getRequestURL, getRouterParam, readBody, type H3Event } from 'h3'
import { z } from 'zod'
import { AUTH_EMAIL_DOMAIN } from '../../shared/config/app'
import { profilSesi } from './auth.controller'
import { buatClientServiceRole } from '../utils/supabase'
import { apakahAdminAktifTerakhir, buatAkunAdmin, cabutSemuaSesiAkun, linkImpersonasiAdmin, resetPasswordAkunAdmin, ubahAkunAktifAdmin } from '../models/admin.model'

async function pastikanAdmin(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Fitur ini hanya untuk admin.' })
  return profil
}

export async function buatAkun(event: H3Event) {
  await pastikanAdmin(event)
  const parsed = z.object({ username: z.string().min(3).max(50).regex(/^[a-z0-9._-]+$/), nama_tampil: z.string().trim().min(1).max(100), peran: z.enum(['admin','kanwil','upt']), kantor_id: z.string().uuid().nullable(), password: z.string().min(8).max(72) }).strict().safeParse(await readBody(event))
  if (!parsed.success || (parsed.data.peran === 'upt') !== Boolean(parsed.data.kantor_id)) throw createError({ statusCode: 400, statusMessage: 'Data akun tidak valid.' })
  const hasil = await buatAkunAdmin(buatClientServiceRole(), parsed.data, AUTH_EMAIL_DOMAIN)
  if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message === 'Akun UPT untuk kantor tersebut sudah tersedia.' ? hasil.error.message : 'Akun gagal dibuat. Periksa username dan data kantor.' })
  return { berhasil: true }
}

export async function resetPassword(event: H3Event) {
  await pastikanAdmin(event)
  const id = getRouterParam(event, 'id')
  const parsed = z.object({ password: z.string().min(8).max(72) }).strict().safeParse(await readBody(event))
  if (!id || !z.string().uuid().safeParse(id).success || !parsed.success) throw createError({ statusCode: 400, statusMessage: 'Data reset password tidak valid.' })
  const { error } = await resetPasswordAkunAdmin(buatClientServiceRole(), id, parsed.data.password)
  if (error) throw createError({ statusCode: 422, statusMessage: 'Password gagal diperbarui.' })
  // Semua perangkat akun ini harus login ulang dengan password baru. Gagal mencabut sesi tidak membatalkan reset.
  const service = buatClientServiceRole()
  const akun = await service.from('profiles').select('username').eq('id', id).maybeSingle()
  const sesiDicabut = akun.data ? await cabutSemuaSesiAkun(service, `${akun.data.username}@${AUTH_EMAIL_DOMAIN}`, parsed.data.password).catch(() => false) : false
  return { berhasil: true, sesiDicabut }
}

export async function ubahAktif(event: H3Event) {
  const profil = await pastikanAdmin(event)
  const id = getRouterParam(event, 'id')
  const parsed = z.object({ aktif: z.boolean() }).strict().safeParse(await readBody(event))
  if (!id || !z.string().uuid().safeParse(id).success || !parsed.success) throw createError({ statusCode: 400, statusMessage: 'Data status akun tidak valid.' })
  const service = buatClientServiceRole()
  if (!parsed.data.aktif) {
    // Cegah kunci-diri: admin tidak boleh menonaktifkan akunnya sendiri atau admin aktif terakhir.
    if (id === profil.id) throw createError({ statusCode: 409, statusMessage: 'Akun yang sedang Anda pakai tidak dapat dinonaktifkan.' })
    if (await apakahAdminAktifTerakhir(service, id)) throw createError({ statusCode: 409, statusMessage: 'Minimal satu akun admin harus tetap aktif.' })
  }
  const hasil = await ubahAkunAktifAdmin(service, id, parsed.data.aktif)
  if (hasil.error || !hasil.data) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan atau gagal diperbarui.' })
  return { berhasil: true }
}

export async function impersonasi(event: H3Event) {
  await pastikanAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID akun tidak valid.' })
  const service = buatClientServiceRole()
  const { data: akun, error } = await service.from('profiles').select('username, aktif').eq('id', id).maybeSingle()
  if (error || !akun?.aktif) throw createError({ statusCode: 404, statusMessage: 'Akun aktif tidak ditemukan.' })
  const tujuan = new URL('/auth/confirm', getRequestURL(event).origin)
  tujuan.searchParams.set('impersonasi', akun.username)
  const hasil = await linkImpersonasiAdmin(service, `${akun.username}@${AUTH_EMAIL_DOMAIN}`, tujuan.toString())
  // Pakai hashed_token + verifyOtp di /auth/confirm. action_link GoTrue menaruh token di URL fragment,
  // sedangkan halaman konfirmasi membaca token_hash dari query.
  const tokenHash = hasil.data?.properties?.hashed_token
  if (hasil.error || !tokenHash) throw createError({ statusCode: 422, statusMessage: 'Tautan impersonasi gagal dibuat.' })
  tujuan.searchParams.set('token_hash', tokenHash)
  tujuan.searchParams.set('type', 'magiclink')
  return { url: tujuan.toString() }
}
