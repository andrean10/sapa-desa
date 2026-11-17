import { toast } from 'vue-sonner'
import { TEKS_UMUM } from '~~/shared/config/teks'

const RUTE_TERLINDUNGI = ['/upt', '/kanwil', '/admin', '/akun']

function peranDiizinkan(jalur: string, peran: 'admin' | 'kanwil' | 'upt'): boolean {
  if (jalur.startsWith('/akun')) return true
  if (peran === 'admin') return true
  if (jalur.startsWith('/upt')) return peran === 'upt'
  if (jalur.startsWith('/kanwil')) return peran === 'kanwil'
  if (jalur.startsWith('/admin')) return false
  return true
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!RUTE_TERLINDUNGI.some(jalur => to.path === jalur || to.path.startsWith(`${jalur}/`))) return

  const { muatProfil, pegawaiBertugasId, daftarPegawai } = useAuth()
  const profil = await muatProfil()
  if (!profil) {
    return navigateTo({ path: '/masuk', query: { redirect: to.fullPath } })
  }

  if (!peranDiizinkan(to.path, profil.peran)) {
    if (import.meta.client) toast.error(TEKS_UMUM.aksesDitolak)
    const berandaPeran = profil.peran === 'upt' ? '/upt' : '/kanwil'
    return navigateTo(berandaPeran)
  }

  if (profil.peran !== 'upt' || !to.path.startsWith('/upt') || pegawaiBertugasId.value) return
  if (to.path === '/upt/pilih-petugas' || to.path === '/akun/password') return

  if (to.path === '/upt/pegawai') {
    const pegawai = await daftarPegawai().catch(() => null)
    if (pegawai && pegawai.length === 0) return
  }

  return navigateTo({ path: '/upt/pilih-petugas', query: { redirect: to.fullPath } })
})
