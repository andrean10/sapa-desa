import { toast } from 'vue-sonner'
import type { PegawaiPilihan, ProfilAkun } from '~~/shared/types/auth'
import { AUTH_EMAIL_DOMAIN } from '~~/shared/config/app'
import { TEKS_UMUM } from '~~/shared/config/teks'

export function useAuth() {
  const api = useApi()
  const profil = useState<ProfilAkun | null>('profil-akun', () => null)
  const pegawaiBertugasId = useCookie<string | null>('sapa-bertugas-id', { path: '/', sameSite: 'lax' })
  const akunImpersonasi = useCookie<string | null>('sapa-impersonasi', { path: '/', sameSite: 'lax' })

  async function masuk(username: string, password: string) {
    const namaAkun = username.trim().toLowerCase()
    if (!/^[a-z0-9._-]+$/.test(namaAkun)) throw new Error('Format username tidak valid.')

    const { error } = await buatClientBrowser().auth.signInWithPassword({
      email: `${namaAkun}@${AUTH_EMAIL_DOMAIN}`,
      password
    })
    if (error) {
      const kode = 'status' in error ? Number(error.status) : 0
      if (kode === 429) throw new Error(TEKS_UMUM.terlaluBanyakPercobaan)
      throw new Error('Username atau password salah.')
    }

    // Petugas bertugas milik sesi sebelumnya tidak boleh terbawa ke akun baru di browser yang sama.
    pegawaiBertugasId.value = null
    try {
      profil.value = await api<ProfilAkun>('/api/auth/me')
      return {
        profil: profil.value,
        pegawai: profil.value.peran === 'upt'
          ? await api<PegawaiPilihan[]>('/api/auth/pegawai-aktif')
          : []
      }
    } catch (galat) {
      await buatClientBrowser().auth.signOut()
      profil.value = null
      const status = galat && typeof galat === 'object'
        ? Number('statusCode' in galat ? galat.statusCode : 'status' in galat ? galat.status : 0)
        : 0
      if (status === 403) throw new Error(TEKS_UMUM.akunNonaktif, { cause: galat })
      if (status === 429) throw new Error(TEKS_UMUM.terlaluBanyakPercobaan, { cause: galat })
      throw new Error('Akun belum aktif atau profil belum dapat dimuat.', { cause: galat })
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
      if (!import.meta.client) return null
      if (status === 403) {
        toast.error(TEKS_UMUM.akunNonaktif)
      } else if (status === 401 && adaSesiSebelumnya) {
        toast.error(TEKS_UMUM.sesiBerakhir)
      }
      return null
    }
  }

  async function daftarPegawai() {
    return await api<PegawaiPilihan[]>('/api/auth/pegawai-aktif')
  }

  async function gantiPassword(passwordSaatIni: string, passwordBaru: string) {
    return await api<{ berhasil: true }>('/api/auth/password', {
      method: 'PATCH',
      body: { passwordSaatIni, passwordBaru }
    })
  }

  async function keluar() {
    await buatClientBrowser().auth.signOut()
    profil.value = null
    pegawaiBertugasId.value = null
    akunImpersonasi.value = null
    await navigateTo('/masuk')
  }

  function pilihPegawai(id: string) {
    pegawaiBertugasId.value = id
  }

  return { profil, pegawaiBertugasId, masuk, muatProfil, daftarPegawai, gantiPassword, keluar, pilihPegawai }
}
