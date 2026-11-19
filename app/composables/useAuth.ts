import { toast } from 'vue-sonner'
import type { ProfilAkun } from '~~/shared/types/auth'
import { AUTH_EMAIL_DOMAIN, MASA_BERLAKU_PROFIL_MS } from '~~/shared/config/app'
import { TEKS_UMUM } from '~~/shared/config/teks'

export function useAuth() {
  const api = useApi()
  const profil = useState<ProfilAkun | null>('profil-akun', () => null)
  const profilDimuatPada = useState<number>('profil-dimuat-pada', () => 0)
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
      // Supabase hanya menjawab user_banned bila password benar, jadi pesan ini tidak membuka username yang tidak ada.
      if ('code' in error && error.code === 'user_banned') throw new Error(TEKS_UMUM.akunNonaktif)
      throw new Error('Username atau password salah.')
    }

    try {
      profil.value = await api<ProfilAkun>('/api/auth/me')
      profilDimuatPada.value = Date.now()
      return { profil: profil.value }
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

  /**
   * Memuat profil akun. Di browser, profil yang baru diverifikasi (< MASA_BERLAKU_PROFIL_MS) dipakai ulang
   * agar pindah menu tidak menunggu /api/auth/me. `paksa` selalu memverifikasi ke server.
   */
  async function muatProfil(opsi: { paksa?: boolean } = {}) {
    if (!opsi.paksa && import.meta.client && profil.value && Date.now() - profilDimuatPada.value < MASA_BERLAKU_PROFIL_MS) return profil.value
    const adaSesiSebelumnya = profil.value !== null
    try {
      profil.value = await api<ProfilAkun>('/api/auth/me')
      profilDimuatPada.value = Date.now()
      return profil.value
    } catch (error) {
      profil.value = null
      profilDimuatPada.value = 0
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

  async function gantiPassword(passwordSaatIni: string, passwordBaru: string) {
    return await api<{ berhasil: true }>('/api/auth/password', {
      method: 'PATCH',
      body: { passwordSaatIni, passwordBaru }
    })
  }

  async function keluar() {
    await buatClientBrowser().auth.signOut()
    profil.value = null
    profilDimuatPada.value = 0
    akunImpersonasi.value = null
    await navigateTo('/masuk')
  }

  return { profil, masuk, muatProfil, gantiPassword, keluar }
}
