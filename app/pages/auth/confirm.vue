<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({ layout: 'publik' })
const route = useRoute()
const status = ref('Memverifikasi tautan masuk…')
const impersonasi = useCookie<string | null>('sapa-impersonasi', { sameSite: 'lax', path: '/' })
onMounted(async () => {
  const hash = typeof route.query.token_hash === 'string' ? route.query.token_hash : ''
  const jenis = route.query.type === 'magiclink' ? 'magiclink' : null
  if (!hash || !jenis) { status.value = 'Tautan masuk tidak valid atau sudah kedaluwarsa.'; return }
  const { error } = await buatClientBrowser().auth.verifyOtp({ token_hash: hash, type: jenis })
  if (error) { status.value = 'Tautan masuk tidak valid atau sudah kedaluwarsa.'; return }
  impersonasi.value = typeof route.query.impersonasi === 'string' ? route.query.impersonasi : null
  try {
    const profil = await useApi()<{ peran: 'admin'|'kanwil'|'upt' }>('/api/auth/me')
    await navigateTo(profil.peran === 'upt' ? '/upt' : '/kanwil')
  } catch (galat) {
    impersonasi.value = null
    status.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Profil akun belum dapat dimuat. Silakan masuk kembali.'
  }
})
</script>

<template><main class="flex min-h-svh items-center justify-center p-4"><Card class="w-full max-w-md"><CardHeader><CardTitle>Masuk SAPA DESA</CardTitle></CardHeader><CardContent role="status">{{ status }}</CardContent></Card></main></template>
