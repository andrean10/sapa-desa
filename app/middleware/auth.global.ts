import { toast } from 'vue-sonner'
import { TEKS_UMUM } from '~~/shared/config/teks'

const RUTE_TERLINDUNGI = ['/upt', '/kanwil', '/admin']

function peranDiizinkan(jalur: string, peran: 'admin' | 'kanwil' | 'upt'): boolean {
  if (peran === 'admin') return true
  if (jalur.startsWith('/upt')) return peran === 'upt'
  if (jalur.startsWith('/kanwil')) return peran === 'kanwil'
  if (jalur.startsWith('/admin')) return false
  return true
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!RUTE_TERLINDUNGI.some(jalur => to.path === jalur || to.path.startsWith(`${jalur}/`))) return

  const { muatProfil } = useAuth()
  const profil = await muatProfil()
  if (!profil) {
    return navigateTo({ path: '/masuk', query: { redirect: to.fullPath } })
  }

  if (!peranDiizinkan(to.path, profil.peran)) {
    if (import.meta.client) toast.error(TEKS_UMUM.aksesDitolak)
    const berandaPeran = profil.peran === 'upt' ? '/upt' : '/kanwil'
    return navigateTo(berandaPeran)
  }
})
