import { createError, type H3Event } from 'h3'
import { APP_NAME } from '../../shared/config/app'
import { buatClientSesiUser } from '../utils/supabase'
import { ambilPegawaiAktif, ambilProfilSesi, type ProfilSesi } from '../models/auth.model'

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

export async function daftarPegawaiAktif(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') {
    throw createError({ statusCode: 403, statusMessage: 'Pemilihan petugas hanya berlaku untuk akun UPT.' })
  }

  const { data, error } = await ambilPegawaiAktif(buatClientSesiUser(event))
  if (error) {
    throw createError({ statusCode: 503, statusMessage: 'Daftar pegawai belum dapat dimuat.' })
  }
  return data
}
