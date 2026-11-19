<script setup lang="ts">
import { toast } from 'vue-sonner'
import { KeyRound, LogIn, MoreHorizontal, Power, Search, ShieldCheck, UserPlus, Users } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Switch } from '~/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog'
import { PERAN_PENGGUNA } from '~~/shared/config/teks'

definePageMeta({ layout: 'dashboard', title: 'Kelola akun' })
type Akun = { id: string; username: string; nama_tampil: string; peran: 'admin' | 'kanwil' | 'upt'; kantor_id: string | null; aktif: boolean }
const api = useApi()
const { profil } = useAuth()
const { data, pending, error, refresh } = await useAsyncData('admin-akun', () => api<{ akun: Akun[]; kantor: { id: string; nama: string; aktif: boolean }[] }>('/api/admin/akun'), { lazy: true })
const namaKantor = computed(() => Object.fromEntries((data.value?.kantor ?? []).map(k => [k.id, k.nama])))
const labelPeran = (peran: Akun['peran']) => PERAN_PENGGUNA.find(item => item.value === peran)?.label ?? peran
const ringkasanAkun = computed(() => {
  const akun = data.value?.akun ?? []
  return [
    { label: 'Total akun', nilai: akun.length, ikon: Users, nada: 'netral' as const },
    { label: 'Aktif', nilai: akun.filter(item => item.aktif).length, ikon: ShieldCheck, nada: 'sukses' as const },
    { label: 'Nonaktif', nilai: akun.filter(item => !item.aktif).length, ikon: Power, nada: 'peringatan' as const },
    { label: 'Akun UPT', nilai: akun.filter(item => item.peran === 'upt').length, ikon: Users, nada: 'info' as const }
  ]
})
const cari = ref('')
const filterPeran = ref('')
const terlihat = computed(() => {
  const kunci = cari.value.trim().toLowerCase()
  return (data.value?.akun ?? []).filter(akun => (!filterPeran.value || akun.peran === filterPeran.value) && (!kunci || akun.username.includes(kunci) || akun.nama_tampil.toLowerCase().includes(kunci)))
})

// Buat akun: password awal tidak pernah disimpan atau ditampilkan ulang.
const dialogBuat = ref(false)
const baru = ref({ username: '', nama_tampil: '', peran: 'upt' as Akun['peran'], kantor_id: '', password: '' })
const busy = ref<string | boolean>(false)
async function buat() {
  busy.value = true
  try {
    await api('/api/admin/akun', { method: 'POST', body: { ...baru.value, kantor_id: baru.value.peran === 'upt' ? baru.value.kantor_id : null } })
    baru.value = { username: '', nama_tampil: '', peran: 'upt', kantor_id: '', password: '' }
    dialogBuat.value = false
    await refresh(); toast.success('Akun berhasil dibuat.')
  } catch (e) { toast.error(pesanGalat(e, 'Akun gagal dibuat.')) }
  finally { busy.value = false }
}
// data dari useAsyncData bersifat shallow: mengubah properti di dalamnya tidak memicu render, jadi objeknya diganti utuh.
function perbaruiStatusLokal(id: string, aktif: boolean) {
  if (!data.value) return
  data.value = { ...data.value, akun: data.value.akun.map(item => item.id === id ? { ...item, aktif } : item) }
}
async function setAktif(akun: Akun) {
  busy.value = akun.id
  try { await api(`/api/admin/akun/${akun.id}/aktif`, { method: 'PATCH', body: { aktif: !akun.aktif } }); perbaruiStatusLokal(akun.id, !akun.aktif); toast.success('Status akun diperbarui.') }
  catch (galat) { toast.error(pesanGalat(galat, 'Status akun gagal diperbarui.')) } finally { busy.value = false }
}
const passwordBaru = ref('')
async function reset(akun: Akun) {
  busy.value = akun.id
  try { await api(`/api/admin/akun/${akun.id}/password`, { method: 'PATCH', body: { password: passwordBaru.value } }); toast.success('Password berhasil direset.') }
  catch { toast.error('Password gagal direset.') } finally { passwordBaru.value = ''; busy.value = false }
}
// Data tindakan dipisah dari status buka-tutup dialog: dialog menutup lebih dulu saat tombol ditekan, jadi datanya tidak boleh ikut hilang.
const tindakanKonfirmasi = ref<{ jenis: 'aktif' | 'password'; akun: Akun } | null>(null)
const dialogKonfirmasi = ref(false)
function minta(jenis: 'aktif' | 'password', akun: Akun) { passwordBaru.value = ''; tindakanKonfirmasi.value = { jenis, akun }; dialogKonfirmasi.value = true }
async function konfirmasiTindakan() {
  const tindakan = tindakanKonfirmasi.value
  if (!tindakan) return
  if (tindakan.jenis === 'password' && passwordBaru.value.length < 8) { toast.error('Password baru minimal 8 karakter.'); return }
  dialogKonfirmasi.value = false
  if (tindakan.jenis === 'aktif') await setAktif(tindakan.akun)
  else await reset(tindakan.akun)
}
// Menonaktifkan berdampak (akun kehilangan akses) sehingga dikonfirmasi; mengaktifkan kembali langsung diproses.
function ubahStatus(akun: Akun) {
  if (akun.aktif) minta('aktif', akun)
  else void setAktif(akun)
}
async function masukSebagai(akun: Akun) {
  const tab = window.open('about:blank', '_blank')
  if (!tab) { toast.error('Browser memblokir tab baru. Izinkan pop-up untuk membuka sesi impersonasi.'); return }
  busy.value = akun.id
  try { const hasil = await api<{ url: string }>(`/api/admin/akun/${akun.id}/impersonasi`, { method: 'POST' }); tab.opener = null; tab.location.replace(hasil.url) }
  catch { tab.close(); toast.error('Tautan masuk sebagai akun gagal dibuat.') } finally { busy.value = false }
}
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Kelola akun" deskripsi="Akun petugas admin, Kanwil, dan UPT. Pendaftaran publik dimatikan; akun hanya dibuat di sini.">
      <template #aksi><Button @click="dialogBuat = true"><UserPlus class="size-4" />Buat akun</Button></template>
    </DashboardKepalaHalaman>
    <section v-if="data?.akun" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan akun">
      <DashboardKartuAngka v-for="item in ringkasanAkun" :key="item.label" v-bind="item" ringkas />
    </section>

    <DashboardBingkaiTabel>
      <template #toolbar>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative w-full sm:w-72"><Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><label for="cari-akun" class="sr-only">Cari akun</label><Input id="cari-akun" v-model="cari" type="search" placeholder="Cari username atau nama…" class="h-9 bg-card pl-9" /></div>
          <DashboardSegmenTab :items="[{ value: '', label: 'Semua' }, ...PERAN_PENGGUNA.map(item => ({ value: item.value, label: item.label }))]" :aktif="filterPeran" label="Filter peran" @pilih="value => filterPeran = value" />
        </div>
      </template>
      <div v-if="pending" class="p-4"><DashboardStateMemuat /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Daftar akun belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!terlihat.length" class="p-4"><DashboardStateKosong :judul="data?.akun.length ? 'Tidak ada akun yang cocok.' : 'Belum ada akun.'" :ikon="Users" ringkas /></div>
      <Table v-else class="min-w-[760px]">
        <TableHeader><TableRow><TableHead>Akun</TableHead><TableHead>Peran</TableHead><TableHead>Kantor</TableHead><TableHead>Status</TableHead><TableHead class="text-right"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow v-for="akun in terlihat" :key="akun.id">
            <TableCell><p class="font-medium">{{ akun.nama_tampil }}</p><p class="font-mono text-xs text-muted-foreground">{{ akun.username }}</p></TableCell>
            <TableCell><span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="akun.peran === 'admin' ? 'bg-primary text-primary-foreground' : akun.peran === 'kanwil' ? 'bg-emas/20 text-emas-foreground' : 'bg-info-muda text-info'">{{ labelPeran(akun.peran) }}</span></TableCell>
            <TableCell class="text-muted-foreground">{{ akun.kantor_id ? namaKantor[akun.kantor_id] ?? '—' : '—' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2.5">
                <Switch :model-value="akun.aktif" :disabled="akun.id === profil?.id || busy === akun.id" :aria-label="`${akun.aktif ? 'Nonaktifkan' : 'Aktifkan'} akun ${akun.username}`" @update:model-value="ubahStatus(akun)" />
                <span class="text-sm font-medium" :class="akun.aktif ? 'text-sukses' : 'text-muted-foreground'">{{ akun.aktif ? 'Aktif' : 'Nonaktif' }}</span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <span v-if="akun.id === profil?.id" class="text-xs text-muted-foreground">Akun Anda</span>
              <DropdownMenu v-else>
                <DropdownMenuTrigger as-child><Button variant="ghost" size="icon-sm" :disabled="busy === akun.id" :aria-label="`Tindakan untuk ${akun.username}`"><MoreHorizontal class="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48">
                  <DropdownMenuItem :disabled="!akun.aktif" @select="masukSebagai(akun)"><LogIn />Masuk sebagai</DropdownMenuItem>
                  <DropdownMenuItem @select="minta('password', akun)"><KeyRound />Reset password</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DashboardBingkaiTabel>

    <Dialog v-model:open="dialogBuat">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader><DialogTitle>Buat akun</DialogTitle><DialogDescription>Password awal hanya dipakai untuk membuat akun dan tidak disimpan atau ditampilkan ulang.</DialogDescription></DialogHeader>
        <form id="form-akun" class="grid gap-4 sm:grid-cols-2" @submit.prevent="buat">
          <label class="grid gap-1.5 text-sm font-medium">Username<Input v-model="baru.username" required pattern="[a-z0-9._-]+" autocomplete="off" placeholder="huruf kecil, angka, . _ -" /></label>
          <label class="grid gap-1.5 text-sm font-medium">Nama tampil<Input v-model="baru.nama_tampil" required maxlength="100" /></label>
          <label class="grid gap-1.5 text-sm font-medium">Peran<NativeSelect v-model="baru.peran" class="w-full"><NativeSelectOption v-for="peran in PERAN_PENGGUNA" :key="peran.value" :value="peran.value">{{ peran.label }}</NativeSelectOption></NativeSelect></label>
          <label v-if="baru.peran === 'upt'" class="grid gap-1.5 text-sm font-medium">Kantor<NativeSelect v-model="baru.kantor_id" class="w-full" required><NativeSelectOption value="">Pilih kantor</NativeSelectOption><NativeSelectOption v-for="k in data?.kantor.filter(k => k.aktif)" :key="k.id" :value="k.id">{{ k.nama }}</NativeSelectOption></NativeSelect></label>
          <label class="grid gap-1.5 text-sm font-medium sm:col-span-2">Password awal<AkunInputPassword v-model="baru.password" required minlength="8" autocomplete="new-password" /><span class="text-xs font-normal text-muted-foreground">Minimal 8 karakter. Sampaikan langsung ke pemilik akun.</span></label>
        </form>
        <DialogFooter><Button variant="outline" @click="dialogBuat = false">Batal</Button><Button type="submit" form="form-akun" :disabled="!!busy">{{ busy === true ? 'Membuat…' : 'Buat akun' }}</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="dialogKonfirmasi">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ tindakanKonfirmasi?.jenis === 'password' ? `Reset password ${tindakanKonfirmasi?.akun.username}?` : tindakanKonfirmasi?.akun.aktif ? 'Nonaktifkan akun?' : 'Aktifkan akun?' }}</AlertDialogTitle>
          <AlertDialogDescription>{{ tindakanKonfirmasi?.jenis === 'password' ? 'Password baru tidak akan ditampilkan kembali. Akun ini akan keluar dari semua perangkat dan harus login ulang.' : tindakanKonfirmasi?.akun.aktif ? `Akun ${tindakanKonfirmasi?.akun.username} akan kehilangan akses SAPA DESA.` : `Akun ${tindakanKonfirmasi?.akun.username} akan dapat mengakses SAPA DESA kembali.` }}</AlertDialogDescription>
        </AlertDialogHeader>
        <label v-if="tindakanKonfirmasi?.jenis === 'password'" class="grid gap-1.5 text-sm font-medium">Password baru<AkunInputPassword v-model="passwordBaru" minlength="8" autocomplete="new-password" /></label>
        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction :disabled="!!busy || (tindakanKonfirmasi?.jenis === 'password' && passwordBaru.length < 8)" :class="tindakanKonfirmasi?.jenis === 'aktif' && tindakanKonfirmasi.akun.aktif ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''" @click.prevent="konfirmasiTindakan">Konfirmasi</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
