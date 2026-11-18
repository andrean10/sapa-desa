<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { PUBLIC_BRAND_NAME } from '~~/shared/config/app'
import type { PeranAplikasi } from '~~/shared/config/app'
import { TEKS_LOGIN } from '~~/shared/config/teks'
import { Button } from '~/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Spinner } from '~/components/ui/spinner'

definePageMeta({ layout: false })
useHead({ title: TEKS_LOGIN.judul, meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const { masuk, muatProfil } = useAuth()
const route = useRoute()
const username = ref('')
const password = ref('')
const passwordTerlihat = ref(false)
const sedangMemproses = ref(false)
const pesanError = ref('')
// Form disembunyikan selama sesi diperiksa agar akun yang sudah login tidak melihat form login sebelum dialihkan.
const memeriksaSesi = ref(true)
watch(username, (value) => { const normal = value.toLowerCase().trim(); if (normal !== value) username.value = normal })

function tujuanSetelahMasuk(peran: PeranAplikasi) {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  const path = redirect.split(/[?#]/)[0] ?? ''
  const aman = path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')
  const sesuaiPeran = peran === 'upt' ? path === '/upt' || path.startsWith('/upt/') || path === '/akun/password' : peran === 'admin' ? path === '/kanwil' || path.startsWith('/kanwil/') || path.startsWith('/admin/') || path === '/akun/password' : path === '/kanwil' || path.startsWith('/kanwil/') || path === '/akun/password'
  return aman && sesuaiPeran ? redirect : peran === 'upt' ? '/upt/pilih-petugas' : '/kanwil'
}
function tujuanAkses(peran: PeranAplikasi) {
  const tujuan = tujuanSetelahMasuk(peran)
  const path = tujuan.split(/[?#]/)[0] ?? ''
  return peran === 'upt' && !path.startsWith('/upt/pilih-petugas') && path !== '/akun/password' ? `/upt/pilih-petugas?redirect=${encodeURIComponent(tujuan)}` : tujuan
}
onMounted(async () => {
  let sudahLogin = false
  try {
    const akun = await muatProfil()
    if (akun) { sudahLogin = true; await navigateTo(tujuanAkses(akun.peran)) }
  } finally {
    // Bila sudah login, kartu "Memeriksa sesi…" tetap tampil sampai halaman berpindah.
    if (!sudahLogin) memeriksaSesi.value = false
  }
})
async function submitLogin() {
  sedangMemproses.value = true
  pesanError.value = ''
  try { const hasil = await masuk(username.value, password.value); await navigateTo(tujuanAkses(hasil.profil.peran)) }
  catch (error) { pesanError.value = error instanceof Error ? error.message : TEKS_LOGIN.gagal }
  finally { sedangMemproses.value = false }
}
</script>

<template>
  <main class="flex min-h-svh items-start justify-center bg-background px-5 py-8 sm:items-center sm:px-8 sm:py-12">
    <section class="w-full max-w-md">
      <div class="bg-card p-6 shadow-card sm:p-10">
        <NuxtLink to="/" class="mx-auto mb-8 flex w-fit max-w-full items-center gap-3 text-primary no-underline sm:mb-10" :aria-label="PUBLIC_BRAND_NAME">
          <img class="size-14 shrink-0 object-contain sm:size-16" src="/images/logo.webp" alt="" width="64" height="64">
          <span class="text-[0.68rem] font-black leading-[1.2] tracking-[.07em] sm:text-xs">SISTEM PELAPORAN<br>PEMANTAUAN AKTIFITAS<br>DESA BINAAN IMIGRASI</span>
        </NuxtLink>
        <div v-if="memeriksaSesi" class="grid place-items-center gap-4 py-10 text-center" role="status" aria-live="polite">
          <Spinner class="size-8 text-primary" />
          <div><p class="text-lg font-extrabold text-primary">{{ TEKS_LOGIN.memeriksaSesi }}</p><p class="mt-1 text-sm text-muted-foreground">{{ TEKS_LOGIN.memeriksaSesiBantuan }}</p></div>
        </div>
        <template v-else>
        <h1 class="mb-7 text-left text-3xl font-black tracking-tight text-primary">Login</h1>
          <form @submit.prevent="submitLogin">
            <FieldGroup class="gap-5">
              <Field>
                <FieldLabel class="text-sm font-bold text-primary" for="username">{{ TEKS_LOGIN.username }}</FieldLabel>
                <Input id="username" v-model="username" class="h-12 rounded-xl border-input bg-background px-4 text-base shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" autocomplete="username" autocapitalize="none" spellcheck="false" required />
              </Field>
              <Field>
                <FieldLabel class="text-sm font-bold text-primary" for="password">{{ TEKS_LOGIN.password }}</FieldLabel>
                <div class="relative"><Input id="password" v-model="password" class="h-12 rounded-xl border-input bg-background px-4 pr-12 text-base shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" :type="passwordTerlihat ? 'text' : 'password'" autocomplete="current-password" required /><Button class="absolute right-1 top-1 size-10" variant="ghost" size="icon" type="button" :aria-label="passwordTerlihat ? TEKS_LOGIN.sembunyikan : TEKS_LOGIN.tampilkan" @click="passwordTerlihat = !passwordTerlihat"><EyeOff v-if="passwordTerlihat" /><Eye v-else /></Button></div>
              </Field>
              <Field>
                <Button class="min-h-12 w-full rounded-xl text-base font-bold" size="lg" type="submit" :disabled="sedangMemproses">{{ sedangMemproses ? TEKS_LOGIN.memproses : TEKS_LOGIN.masuk }}</Button>
                <p v-if="pesanError" class="text-sm text-destructive" role="alert">{{ pesanError }}</p>
              </Field>
            </FieldGroup>
          </form>
        <p class="mt-6 text-sm leading-5 text-muted-foreground">{{ TEKS_LOGIN.bantuan }}</p>
        </template>
      </div>
    </section>
  </main>
</template>
