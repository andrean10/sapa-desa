<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { APP_NAME, PUBLIC_BRAND_NAME, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'
import type { PeranAplikasi } from '~~/shared/config/app'
import { TEKS_LOGIN, TEKS_UMUM } from '~~/shared/config/teks'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

definePageMeta({ layout: 'publik' })
useHead({ title: TEKS_LOGIN.judul, meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const { masuk, muatProfil } = useAuth()
const route = useRoute()
const username = ref('')
const password = ref('')
const passwordTerlihat = ref(false)
const sedangMemproses = ref(false)
const pesanError = ref('')
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
  const akun = await muatProfil()
  if (akun) await navigateTo(tujuanAkses(akun.peran))
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
  <main class="relative flex min-h-svh items-center justify-center overflow-hidden bg-muted/50 px-4 py-10 sm:px-8">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-2 bg-accent" aria-hidden="true" />
    <div class="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:min-h-[38rem] md:grid-cols-[.9fr_1.1fr]">
      <aside class="relative flex flex-col justify-between overflow-hidden bg-primary p-7 text-primary-foreground sm:p-10">
        <div class="absolute -right-20 -top-24 size-72 rounded-full border-[1px] border-white/10" aria-hidden="true" />
        <div class="absolute -bottom-32 -left-24 size-80 rounded-full border-[1px] border-white/10" aria-hidden="true" />
        <NuxtLink to="/" class="relative flex items-center gap-4 text-white no-underline" :aria-label="PUBLIC_BRAND_NAME">
          <img class="size-16 shrink-0 object-contain" src="/images/logo.webp" alt="" width="64" height="64">
          <span class="max-w-[17rem] text-xs font-black leading-tight tracking-wider sm:text-sm">SISTEM PELAPORAN<br>PEMANTAUAN AKTIFITAS<br>DESA BINAAN IMIGRASI</span>
        </NuxtLink>
        <div class="relative mt-12">
          <p class="text-xs font-extrabold uppercase tracking-[.2em] text-accent">{{ REGIONAL_OFFICE_NAME }}</p>
          <h1 class="mt-5 max-w-md text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">Ruang kerja<br>petugas imigrasi.</h1>
          <p class="mt-5 max-w-sm text-base leading-7 text-white/75">Masuk untuk menindaklanjuti laporan masyarakat dan mencatat kegiatan di desa binaan.</p>
        </div>
        <p class="relative mt-12 text-xs font-medium tracking-wide text-white/55">{{ APP_NAME }} · Riau</p>
      </aside>
      <section class="flex items-center justify-center px-6 py-10 sm:px-12">
        <div class="w-full max-w-md">
          <div class="mb-8">
            <p class="text-xs font-extrabold uppercase tracking-[.18em] text-primary">Akses petugas</p>
            <CardTitle class="mt-3 text-3xl font-black tracking-tight">{{ TEKS_LOGIN.judul }}</CardTitle>
            <CardDescription class="mt-2 text-base">{{ TEKS_LOGIN.pengantar }}</CardDescription>
          </div>
          <form @submit.prevent="submitLogin">
            <FieldGroup>
              <Field>
                <FieldLabel for="username">{{ TEKS_LOGIN.username }}</FieldLabel>
                <Input id="username" v-model="username" autocomplete="username" autocapitalize="none" spellcheck="false" required />
              </Field>
              <Field>
                <FieldLabel for="password">{{ TEKS_LOGIN.password }}</FieldLabel>
                <div class="relative"><Input id="password" v-model="password" class="pr-11" :type="passwordTerlihat ? 'text' : 'password'" autocomplete="current-password" required /><Button class="absolute right-1 top-1" variant="ghost" size="icon" type="button" :aria-label="passwordTerlihat ? TEKS_LOGIN.sembunyikan : TEKS_LOGIN.tampilkan" @click="passwordTerlihat = !passwordTerlihat"><EyeOff v-if="passwordTerlihat" /><Eye v-else /></Button></div>
                <FieldDescription>{{ TEKS_LOGIN.bantuan }}</FieldDescription>
              </Field>
              <Field>
                <Button class="w-full" size="lg" type="submit" :disabled="sedangMemproses">{{ sedangMemproses ? TEKS_LOGIN.memproses : TEKS_LOGIN.masuk }}</Button>
                <p v-if="pesanError" class="text-sm text-destructive" role="alert">{{ pesanError }}</p>
              </Field>
            </FieldGroup>
          </form>
          <p class="mt-7 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">{{ TEKS_UMUM.identitasPetugas }} · {{ APP_NAME }}</p>
        </div>
      </section>
    </div>
  </main>
</template>
