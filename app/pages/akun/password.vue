<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { TEKS_UMUM } from '~~/shared/config/teks'
definePageMeta({ layout: 'dashboard', title: 'Ganti password' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const { gantiPassword } = useAuth()
const isian = reactive({ passwordSaatIni: '', passwordBaru: '', ulangiPassword: '' })
const sedangMenyimpan = ref(false)
const pesan = ref('')
const berhasil = ref(false)
async function simpan() {
  pesan.value = ''; berhasil.value = false
  if (isian.passwordBaru !== isian.ulangiPassword) { pesan.value = 'Ulangi password baru dengan benar.'; return }
  sedangMenyimpan.value = true
  try { await gantiPassword(isian.passwordSaatIni, isian.passwordBaru); isian.passwordSaatIni = ''; isian.passwordBaru = ''; isian.ulangiPassword = ''; berhasil.value = true }
  catch (error) { pesan.value = (error as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Password belum dapat diganti.' }
  finally { sedangMenyimpan.value = false }
}
</script>

<template>
  <Card class="mx-auto max-w-xl">
    <CardHeader><CardTitle>{{ TEKS_UMUM.gantiPassword }}</CardTitle><CardDescription>Gunakan kata sandi yang kuat dan tidak dipakai di layanan lain.</CardDescription></CardHeader>
    <CardContent><form @submit.prevent="simpan"><FieldGroup>
      <Field><FieldLabel for="password-lama">Password saat ini</FieldLabel><Input id="password-lama" v-model="isian.passwordSaatIni" type="password" autocomplete="current-password" required  /></Field>
      <Field><FieldLabel for="password-baru">Password baru</FieldLabel><Input id="password-baru" v-model="isian.passwordBaru" type="password" autocomplete="new-password" minlength="8" maxlength="128" required  /></Field>
      <Field><FieldLabel for="password-ulang">Ulangi password baru</FieldLabel><Input id="password-ulang" v-model="isian.ulangiPassword" type="password" autocomplete="new-password" minlength="8" maxlength="128" required  /></Field>
      <p v-if="pesan" class="text-sm text-destructive" role="alert">{{ pesan }}</p><p v-if="berhasil" class="text-sm font-medium text-primary" role="status">Password diganti.</p><Button type="submit" :disabled="sedangMenyimpan">{{ sedangMenyimpan ? 'Menyimpan…' : TEKS_UMUM.gantiPassword }}</Button>
    </FieldGroup></form></CardContent>
  </Card>
</template>
