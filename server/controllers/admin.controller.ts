import { createError, getRequestURL, getRouterParam, readBody, type H3Event } from 'h3'
import { z } from 'zod'
import { AUTH_EMAIL_DOMAIN } from '../../shared/config/app'
import { profilSesi } from './auth.controller'
import { buatClientServiceRole } from '../utils/supabase'
import { buatAkunAdmin, linkImpersonasiAdmin, resetPasswordAkunAdmin, ubahAkunAktifAdmin } from '../models/admin.model'

async function pastikanAdmin(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Fitur ini hanya untuk admin.' })
}

export async function buatAkun(event: H3Event) {
  await pastikanAdmin(event)
  const parsed = z.object({ username: z.string().regex(/^[a-z0-9._-]+$/), nama_tampil: z.string().trim().min(1).max(100), peran: z.enum(['admin','kanwil','upt']), kantor_id: z.string().uuid().nullable(), password: z.string().min(8).max(72) }).strict().safeParse(await readBody(event))
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
  return { berhasil: true }
}

export async function ubahAktif(event: H3Event) {
  await pastikanAdmin(event)
  const id = getRouterParam(event, 'id')
  const parsed = z.object({ aktif: z.boolean() }).strict().safeParse(await readBody(event))
  if (!id || !z.string().uuid().safeParse(id).success || !parsed.success) throw createError({ statusCode: 400, statusMessage: 'Data status akun tidak valid.' })
  const hasil = await ubahAkunAktifAdmin(buatClientServiceRole(), id, parsed.data.aktif)
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
  if (hasil.error || !hasil.data.properties?.action_link) throw createError({ statusCode: 422, statusMessage: 'Tautan impersonasi gagal dibuat.' })
  return { url: hasil.data.properties.action_link }
}
