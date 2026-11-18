<script setup lang="ts">
import { ArrowLeft, Eye, EyeOff } from '@lucide/vue'
import { APP_NAME, APP_TAGLINE, FOTO_LANDING, PUBLIC_BRAND_NAME } from '~~/shared/config/app'
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
  return aman && sesuaiPeran ? redirect : peran === 'upt' ? '/upt' : '/kanwil'
}
onMounted(async () => {
  let sudahLogin = false
  try {
    const akun = await muatProfil()
    if (akun) { sudahLogin = true; await navigateTo(tujuanSetelahMasuk(akun.peran)) }
  } finally {
    // Bila sudah login, kartu "Memeriksa sesi…" tetap tampil sampai halaman berpindah.
    if (!sudahLogin) memeriksaSesi.value = false
  }
})
async function submitLogin() {
  sedangMemproses.value = true
  pesanError.value = ''
  try { const hasil = await masuk(username.value, password.value); await navigateTo(tujuanSetelahMasuk(hasil.profil.peran)) }
  catch (error) { pesanError.value = error instanceof Error ? error.message : TEKS_LOGIN.gagal }
  finally { sedangMemproses.value = false }
}
</script>

<template>
  <main class="grid min-h-svh bg-background lg:grid-cols-2">
    <section class="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
      <NuxtLink to="/" class="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition hover:text-primary">
        <ArrowLeft class="size-4" aria-hidden="true" />Kembali ke beranda
      </NuxtLink>

      <div class="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
        <NuxtLink to="/" class="mb-8 flex w-fit max-w-full items-center gap-3 text-primary no-underline" :aria-label="PUBLIC_BRAND_NAME">
          <img class="size-14 shrink-0 object-contain" src="/images/logo.webp" alt="" width="56" height="56">
          <span class="text-[0.68rem] leading-[1.25] font-black tracking-[.07em]">SISTEM PELAPORAN<br>PEMANTAUAN AKTIFITAS<br>DESA BINAAN IMIGRASI</span>
        </NuxtLink>

        <div v-if="memeriksaSesi" class="grid place-items-center gap-4 py-10 text-center" role="status" aria-live="polite">
          <Spinner class="size-8 text-primary" />
          <div><p class="text-lg font-extrabold text-primary">{{ TEKS_LOGIN.memeriksaSesi }}</p><p class="mt-1 text-sm text-muted-foreground">{{ TEKS_LOGIN.memeriksaSesiBantuan }}</p></div>
        </div>
        <template v-else>
          <h1 class="text-2xl font-extrabold tracking-tight">{{ TEKS_LOGIN.judul }}</h1>
          <p class="mt-1.5 mb-7 text-sm text-muted-foreground">{{ TEKS_LOGIN.pengantar }}</p>
          <form @submit.prevent="submitLogin">
            <FieldGroup class="gap-5">
              <Field>
                <FieldLabel class="text-sm font-semibold" for="username">{{ TEKS_LOGIN.username }}</FieldLabel>
                <Input id="username" v-model="username" class="h-11 bg-card px-3.5 text-base shadow-none md:text-sm" autocomplete="username" autocapitalize="none" spellcheck="false" required />
              </Field>
              <Field>
                <FieldLabel class="text-sm font-semibold" for="password">{{ TEKS_LOGIN.password }}</FieldLabel>
                <div class="relative">
                  <Input id="password" v-model="password" class="h-11 bg-card px-3.5 pr-12 text-base shadow-none md:text-sm" :type="passwordTerlihat ? 'text' : 'password'" autocomplete="current-password" required />
                  <Button class="absolute top-1 right-1 size-9" variant="ghost" size="icon" type="button" :aria-label="passwordTerlihat ? TEKS_LOGIN.sembunyikan : TEKS_LOGIN.tampilkan" @click="passwordTerlihat = !passwordTerlihat"><EyeOff v-if="passwordTerlihat" /><Eye v-else /></Button>
                </div>
              </Field>
              <Field>
                <p v-if="pesanError" class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{{ pesanError }}</p>
                <Button class="h-11 w-full text-sm font-semibold" size="lg" type="submit" :disabled="sedangMemproses">
                  <Spinner v-if="sedangMemproses" class="size-4" />{{ sedangMemproses ? TEKS_LOGIN.memproses : TEKS_LOGIN.masuk }}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <p class="mt-6 text-center text-sm text-muted-foreground">{{ TEKS_LOGIN.bantuan }}</p>
        </template>
      </div>
    </section>

    <!-- Panel pendamping: hanya desktop, dekoratif -->
    <aside class="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between" aria-hidden="true">
      <div class="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-foreground/10" />
      <div class="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-primary-foreground/5" />
      <div class="relative z-10 p-12 xl:p-16">
        <p class="text-xs font-bold tracking-[.2em] uppercase opacity-80">{{ APP_NAME }}</p>
        <h2 class="mt-4 max-w-md text-3xl leading-tight font-extrabold xl:text-4xl">Mendampingi desa binaan, melayani aduan masyarakat.</h2>
        <p class="mt-3 max-w-md text-sm leading-relaxed opacity-80">{{ APP_TAGLINE }}</p>
      </div>
      <img class="relative z-10 mx-auto max-h-[62%] w-auto object-contain object-bottom" :src="FOTO_LANDING.pimpasa.src" alt="" :width="FOTO_LANDING.pimpasa.lebar" :height="FOTO_LANDING.pimpasa.tinggi">
    </aside>
  </main>
</template>
