<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { toast } from 'vue-sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog'
import { PERAN_PENGGUNA } from '~~/shared/config/teks'

definePageMeta({ layout: 'dashboard', title: 'Kelola akun' })
type Akun = { id: string; username: string; nama_tampil: string; peran: 'admin'|'kanwil'|'upt'; kantor_id: string|null; aktif: boolean }
const api = useApi()
const { data, pending, error, refresh } = await useAsyncData('admin-akun', () => api<{akun:Akun[]; kantor:{id:string;nama:string;aktif:boolean}[]}>('/api/admin/akun'))
const namaKantor = computed(() => Object.fromEntries((data.value?.kantor ?? []).map(k => [k.id,k.nama])))
const labelPeran = (peran: Akun['peran']) => PERAN_PENGGUNA.find(item => item.value === peran)?.label ?? peran
const baru = ref({ username: '', nama_tampil: '', peran: 'upt' as Akun['peran'], kantor_id: '', password: '' })
const passwordReset = ref<Record<string,string>>({})
const busy = ref<string|boolean>(false)
const tindakanKonfirmasi = ref<{jenis:'aktif'|'password'; akun:Akun}|null>(null)
async function buat() {
  busy.value = true
  try { await api('/api/admin/akun', { method: 'POST', body: { ...baru.value, kantor_id: baru.value.peran === 'upt' ? baru.value.kantor_id : null } }); baru.value = { username:'', nama_tampil:'', peran:'upt', kantor_id:'', password:'' }; await refresh(); toast.success('Akun berhasil dibuat.') }
  catch (e) { toast.error((e as {data?:{statusMessage?:string}})?.data?.statusMessage ?? 'Akun gagal dibuat.') }
  finally { busy.value = false }
}
async function setAktif(akun: Akun) {
  busy.value = akun.id
  try { await api(`/api/admin/akun/${akun.id}/aktif`, { method:'PATCH', body:{aktif:!akun.aktif} }); const baris = data.value?.akun.find(item => item.id === akun.id); if (baris) baris.aktif = !akun.aktif; toast.success('Status akun diperbarui.') }
  catch { toast.error('Status akun gagal diperbarui.') } finally { busy.value = false }
}
async function reset(akun: Akun) {
  busy.value = akun.id
  try { await api(`/api/admin/akun/${akun.id}/password`, { method:'PATCH', body:{password:passwordReset.value[akun.id]} }); passwordReset.value[akun.id]=''; toast.success('Password berhasil direset.') }
  catch { toast.error('Password gagal direset.') } finally { busy.value = false }
}
async function konfirmasiTindakan() {
  const tindakan = tindakanKonfirmasi.value
  if (!tindakan) return
  if (tindakan.jenis === 'aktif') await setAktif(tindakan.akun)
  else await reset(tindakan.akun)
  tindakanKonfirmasi.value = null
}
async function masukSebagai(akun: Akun) {
  const tab = window.open('about:blank', '_blank')
  if (!tab) { toast.error('Browser memblokir tab baru. Izinkan pop-up untuk membuka sesi impersonasi.'); return }
  busy.value = akun.id
  try { const hasil = await api<{url:string}>(`/api/admin/akun/${akun.id}/impersonasi`, { method:'POST' }); tab.opener = null; tab.location.replace(hasil.url) }
  catch { tab.close(); toast.error('Tautan masuk sebagai akun gagal dibuat.') } finally { busy.value = false }
}
</script>

<template>
  <div class="space-y-5">
    <header><h1 class="text-2xl font-semibold">Kelola akun</h1><p class="text-muted-foreground">Akun petugas Kanwil dan UPT SAPA DESA.</p></header>
    <Card><CardHeader><CardTitle>Buat akun</CardTitle><CardDescription>Password awal hanya digunakan untuk membuat akun dan tidak disimpan atau ditampilkan ulang.</CardDescription></CardHeader><CardContent><form class="grid gap-3 sm:grid-cols-2" @submit.prevent="buat"><label class="space-y-1 text-sm">Username<Input v-model="baru.username" required pattern="[a-z0-9._-]+" autocomplete="off" /></label><label class="space-y-1 text-sm">Nama tampil<Input v-model="baru.nama_tampil" required maxlength="100" /></label><label class="space-y-1 text-sm">Peran<NativeSelect v-model="baru.peran"><NativeSelectOption v-for="peran in PERAN_PENGGUNA" :key="peran.value" :value="peran.value">{{ peran.label }}</NativeSelectOption></NativeSelect></label><label v-if="baru.peran==='upt'" class="space-y-1 text-sm">Kantor<NativeSelect v-model="baru.kantor_id" required><NativeSelectOption value="">Pilih kantor</NativeSelectOption><NativeSelectOption v-for="k in data?.kantor.filter(k => k.aktif)" :key="k.id" :value="k.id">{{ k.nama }}</NativeSelectOption></NativeSelect></label><label class="space-y-1 text-sm">Password awal<Input v-model="baru.password" type="password" required minlength="8" autocomplete="new-password" /></label><Button class="self-end" :disabled="!!busy">Buat akun</Button></form></CardContent></Card>
    <Card><CardHeader><CardTitle>Daftar akun</CardTitle><CardDescription>Nama pengguna, peran, kantor, dan status akun.</CardDescription></CardHeader><CardContent>
      <div v-if="pending" class="space-y-3"><Skeleton v-for="n in 5" :key="n" class="h-10 w-full" /></div>
      <div v-else-if="error" class="space-y-3 text-destructive" role="alert">Daftar akun belum dapat dimuat.<Button variant="outline" @click="refresh()">Coba lagi</Button></div>
      <Table v-else><TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Nama tampil</TableHead><TableHead>Peran</TableHead><TableHead>Kantor</TableHead><TableHead>Aktif</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="akun in data?.akun" :key="akun.id"><TableCell class="font-medium">{{ akun.username }}</TableCell><TableCell>{{ akun.nama_tampil }}</TableCell><TableCell>{{ labelPeran(akun.peran) }}</TableCell><TableCell>{{ akun.kantor_id ? namaKantor[akun.kantor_id] ?? '—' : '—' }}</TableCell><TableCell>{{ akun.aktif ? 'Aktif' : 'Nonaktif' }}</TableCell><TableCell class="min-w-64 space-y-2"><Button size="sm" variant="outline" :disabled="busy===akun.id" @click="tindakanKonfirmasi={jenis:'aktif', akun}">{{ akun.aktif ? 'Nonaktifkan' : 'Aktifkan' }}</Button><div class="flex gap-2"><Input v-model="passwordReset[akun.id]" type="password" placeholder="Password baru" minlength="8"/><Button size="sm" variant="outline" :disabled="busy===akun.id || !passwordReset[akun.id]" @click="tindakanKonfirmasi={jenis:'password',akun}">Reset</Button></div><Button size="sm" variant="secondary" :disabled="busy===akun.id || !akun.aktif" @click="masukSebagai(akun)">Masuk sebagai</Button></TableCell></TableRow><TableRow v-if="!data?.akun.length"><TableCell colspan="6" class="text-center text-muted-foreground">Belum ada akun.</TableCell></TableRow></TableBody></Table>
    </CardContent></Card>
    <AlertDialog :open="!!tindakanKonfirmasi" @update:open="(b:boolean)=>!b&&(tindakanKonfirmasi=null)"><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{{ tindakanKonfirmasi?.jenis==='password' ? 'Reset password akun?' : tindakanKonfirmasi?.akun.aktif ? 'Nonaktifkan akun?' : 'Aktifkan akun?' }}</AlertDialogTitle><AlertDialogDescription>{{ tindakanKonfirmasi?.jenis==='password' ? `Password untuk ${tindakanKonfirmasi?.akun.username} akan diganti. Password baru tidak akan ditampilkan kembali.` : tindakanKonfirmasi?.akun.aktif ? `Akun ${tindakanKonfirmasi?.akun.username} akan kehilangan akses SAPA DESA.` : `Akun ${tindakanKonfirmasi?.akun.username} akan dapat mengakses SAPA DESA kembali.` }}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction :disabled="!!busy" @click.prevent="konfirmasiTindakan">Konfirmasi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
</template>
