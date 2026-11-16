import type { PegawaiPilihan, ProfilAkun } from '~~/shared/types/auth'
import { AUTH_EMAIL_DOMAIN } from '~~/shared/config/app'
import { TEKS_UMUM } from '~~/shared/config/teks'

export function useAuth() {
  const api = useApi()
  const profil = useState<ProfilAkun | null>('profil-akun', () => null)
  const pegawaiBertugasId = useCookie<string | null>('sapa-bertugas-id', { path: '/', sameSite: 'lax' })

  async function masuk(username: string, password: string) {
    const namaAkun = username.trim().toLowerCase()
    if (!/^[a-z0-9._-]+$/.test(namaAkun)) throw new Error('Format username tidak valid.')

    const { error } = await buatClientBrowser().auth.signInWithPassword({
      email: `${namaAkun}@${AUTH_EMAIL_DOMAIN}`,
      password
    })
    if (error) throw new Error('Username atau kata sandi tidak sesuai.')

    try {
      profil.value = await api<ProfilAkun>('/api/auth/me')
      return {
        profil: profil.value,
        pegawai: profil.value.peran === 'upt'
          ? await api<PegawaiPilihan[]>('/api/auth/pegawai-aktif')
          : []
      }
    } catch {
      await buatClientBrowser().auth.signOut()
      profil.value = null
      throw new Error('Akun belum aktif atau profil belum dapat dimuat.')
    }
  }

  async function muatProfil() {
    const adaSesiSebelumnya = profil.value !== null
    try {
      profil.value = await api<ProfilAkun>('/api/auth/me')
      return profil.value
    } catch (error) {
      profil.value = null
      const galat = error as { statusCode?: number; status?: number; response?: { status?: number } }
      const status = galat.statusCode ?? galat.status ?? galat.response?.status
      if (status === 403) {
        useState<string | null>('notifikasi-global', () => null).value = TEKS_UMUM.akunNonaktif
      } else if (status === 401 && adaSesiSebelumnya) {
        useState<string | null>('notifikasi-global', () => null).value = TEKS_UMUM.sesiBerakhir
      }
      return null
    }
  }

  async function daftarPegawai() {
    return await api<PegawaiPilihan[]>('/api/auth/pegawai-aktif')
  }

  async function keluar() {
    await buatClientBrowser().auth.signOut()
    profil.value = null
    pegawaiBertugasId.value = null
    await navigateTo('/masuk')
  }

  function pilihPegawai(id: string) {
    pegawaiBertugasId.value = id
  }

  return { profil, pegawaiBertugasId, masuk, muatProfil, daftarPegawai, keluar, pilihPegawai }
}
