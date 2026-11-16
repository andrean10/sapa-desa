export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return

  const { muatProfil, pegawaiBertugasId } = useAuth()
  const profil = await muatProfil()
  if (!profil) return navigateTo('/login')
  if (profil.peran === 'upt' && !pegawaiBertugasId.value) {
    return navigateTo('/login?pilih_petugas=1')
  }
})
