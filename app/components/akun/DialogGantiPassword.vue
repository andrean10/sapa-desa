<script setup lang="ts">
import { toast } from 'vue-sonner'
import { KeyRound } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Spinner } from '~/components/ui/spinner'
import { TEKS_UMUM } from '~~/shared/config/teks'

const { terbuka } = useDialogGantiPassword()
const { gantiPassword } = useAuth()
const isian = reactive({ passwordSaatIni: '', passwordBaru: '', ulangiPassword: '' })
const sedangMenyimpan = ref(false)
const pesan = ref('')

function bersihkan() {
  Object.assign(isian, { passwordSaatIni: '', passwordBaru: '', ulangiPassword: '' })
  pesan.value = ''
}
watch(terbuka, (nilai) => { if (!nilai) bersihkan() })

async function simpan() {
  pesan.value = ''
  if (isian.passwordBaru !== isian.ulangiPassword) { pesan.value = 'Ulangi password baru dengan benar.'; return }
  sedangMenyimpan.value = true
  try {
    await gantiPassword(isian.passwordSaatIni, isian.passwordBaru)
    terbuka.value = false
    toast.success('Password diganti.')
  }
  catch (error) { pesan.value = (error as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Password belum dapat diganti.' }
  finally { sedangMenyimpan.value = false }
}
</script>

<template>
  <Dialog v-model:open="terbuka">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2"><KeyRound class="size-5 text-muted-foreground" aria-hidden="true" />{{ TEKS_UMUM.gantiPassword }}</DialogTitle>
        <DialogDescription>Minimal 8 karakter, berbeda dari password saat ini, dan tidak sama dengan username.</DialogDescription>
      </DialogHeader>
      <form id="form-ganti-password" @submit.prevent="simpan">
        <FieldGroup>
          <Field><FieldLabel for="password-lama">Password saat ini</FieldLabel><AkunInputPassword id="password-lama" v-model="isian.passwordSaatIni" autocomplete="current-password" required /></Field>
          <Field><FieldLabel for="password-baru">Password baru</FieldLabel><AkunInputPassword id="password-baru" v-model="isian.passwordBaru" autocomplete="new-password" minlength="8" maxlength="128" required /></Field>
          <Field><FieldLabel for="password-ulang">Ulangi password baru</FieldLabel><AkunInputPassword id="password-ulang" v-model="isian.ulangiPassword" autocomplete="new-password" minlength="8" maxlength="128" required /></Field>
          <p v-if="pesan" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesan }}</p>
        </FieldGroup>
      </form>
      <DialogFooter>
        <Button type="button" variant="outline" :disabled="sedangMenyimpan" @click="terbuka = false">Batal</Button>
        <Button type="submit" form="form-ganti-password" :disabled="sedangMenyimpan"><Spinner v-if="sedangMenyimpan" class="size-4" />{{ sedangMenyimpan ? 'Menyimpan…' : 'Simpan password' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
