<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { APP_NAME, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'
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
  <main class="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
    <div class="w-full max-w-sm">
      <NuxtLink to="/" class="mb-6 flex items-center justify-center gap-2 text-sm font-semibold text-foreground no-underline"><span class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">SD</span>{{ APP_NAME }}</NuxtLink>
      <Card>
        <CardHeader class="text-center">
          <p class="text-xs font-semibold uppercase tracking-wider text-primary">{{ REGIONAL_OFFICE_NAME }}</p>
          <CardTitle class="text-2xl">{{ TEKS_LOGIN.judul }}</CardTitle>
          <CardDescription>{{ TEKS_LOGIN.pengantar }}</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      <p class="mt-4 text-center text-xs text-muted-foreground">{{ TEKS_UMUM.identitasPetugas }} · {{ APP_NAME }}</p>
    </div>
  </main>
</template>
