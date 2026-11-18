import { createError, readBody, type H3Event } from 'h3'
import { APP_NAME, AUTH_EMAIL_DOMAIN } from '../../shared/config/app'
import { z } from 'zod'
import { buatClientSesiUser } from '../utils/supabase'
import { ambilProfilSesi, type ProfilSesi } from '../models/auth.model'

export async function profilSesi(event: H3Event): Promise<ProfilSesi> {
  const client = buatClientSesiUser(event)
  const { data: auth, error: authError } = await client.auth.getUser()
  if (authError || !auth.user) {
    throw createError({ statusCode: 401, statusMessage: 'Sesi tidak ditemukan. Silakan masuk kembali.' })
  }

  const { data, error } = await ambilProfilSesi(client, auth.user.id)
  if (error) {
    throw createError({ statusCode: 503, statusMessage: 'Profil akun belum dapat dimuat.' })
  }
  if (!data || !data.aktif) {
    throw createError({ statusCode: 403, statusMessage: `Akun tidak aktif atau tidak memiliki profil ${APP_NAME}.` })
  }

  return data
}

export async function gantiPassword(event: H3Event) {
  const profil = await profilSesi(event)
  const input = z.object({ passwordSaatIni: z.string().min(1), passwordBaru: z.string().min(8).max(128) }).strict().safeParse(await readBody(event))
  if (!input.success) throw createError({ statusCode: 400, statusMessage: 'Password baru minimal 8 karakter.' })
  if (input.data.passwordSaatIni === input.data.passwordBaru) throw createError({ statusCode: 400, statusMessage: 'Password baru harus berbeda dari password saat ini.' })
  if (input.data.passwordBaru.toLowerCase() === profil.username.toLowerCase()) throw createError({ statusCode: 400, statusMessage: 'Password baru tidak boleh sama dengan username.' })
  const client = buatClientSesiUser(event)
  const verifikasi = await client.auth.signInWithPassword({ email: `${profil.username}@${AUTH_EMAIL_DOMAIN}`, password: input.data.passwordSaatIni })
  if (verifikasi.error || !verifikasi.data.user) throw createError({ statusCode: 400, statusMessage: 'Password saat ini tidak sesuai.' })
  const hasil = await client.auth.updateUser({ password: input.data.passwordBaru })
  if (hasil.error) throw createError({ statusCode: 400, statusMessage: 'Password baru belum dapat disimpan.' })
  return { berhasil: true }
}
