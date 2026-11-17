<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Pencil, Search, UserPlus, Users } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import type { PegawaiUpt } from '~/composables/usePegawaiUpt'
import { LABEL_FORM } from '~~/shared/config/teks'

definePageMeta({ layout: 'dashboard', title: 'Pegawai' })
const { daftar, tambah, ubah } = usePegawaiUpt()
const { data: pegawai, pending, error, refresh } = await daftar()
const cari = ref('')
const terlihat = computed(() => (pegawai.value ?? []).filter(item => item.nama.toLocaleLowerCase('id').includes(cari.value.trim().toLocaleLowerCase('id'))))
const jumlahAktif = computed(() => (pegawai.value ?? []).filter(item => item.aktif).length)

// Satu dialog untuk tambah dan ubah (PRD 7.6). Tidak ada hapus pegawai.
const dialogTerbuka = ref(false)
const isian = reactive({ id: '', nama: '', nip: '' })
const sibuk = ref(false)
const pesanDialog = ref('')
function bukaDialog(item?: PegawaiUpt) {
  Object.assign(isian, { id: item?.id ?? '', nama: item?.nama ?? '', nip: item?.nip ?? '' })
  pesanDialog.value = ''
  dialogTerbuka.value = true
}
async function simpan() {
  if (!isian.nama.trim()) { pesanDialog.value = 'Nama wajib diisi.'; return }
  sibuk.value = true; pesanDialog.value = ''
  try {
    if (isian.id) await ubah(isian.id, { nama: isian.nama, nip: isian.nip || null })
    else await tambah(isian.nama, isian.nip)
    await refresh(); dialogTerbuka.value = false
    toast.success(isian.id ? 'Data pegawai diperbarui.' : 'Pegawai ditambahkan.')
  } catch (galat) { pesanDialog.value = pesanGalat(galat, isian.id ? 'Data pegawai belum dapat diubah.' : 'Pegawai belum dapat ditambahkan.') }
  finally { sibuk.value = false }
}
const sedangUbahStatus = ref('')
async function gantiAktif(item: PegawaiUpt) {
  sedangUbahStatus.value = item.id
  try { await ubah(item.id, { aktif: !item.aktif }); await refresh(); toast.success(`${item.nama} ${item.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`) }
  catch (galat) {
    // Pesan database tidak memuat nama desa; ambil dari penugasan aktif pegawai.
    toast.error(item.aktif && item.desa_binaan.length
      ? `Tidak dapat dinonaktifkan: masih bertugas sebagai PIMPASA di ${item.desa_binaan.join(', ')}. Minta Kanwil mengakhiri penugasannya terlebih dahulu.`
      : pesanGalat(galat, 'Status pegawai belum dapat diubah.'))
  } finally { sedangUbahStatus.value = '' }
}
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Pegawai kantor" deskripsi="Daftar petugas yang dapat dipilih saat bertugas dan ditugaskan sebagai PIMPASA.">
      <template #aksi><Button @click="bukaDialog()"><UserPlus class="size-4" />Tambah pegawai</Button></template>
    </DashboardKepalaHalaman>
    <DashboardBingkaiTabel>
      <template #toolbar>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="relative w-full sm:w-72"><Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><label for="cari-pegawai" class="sr-only">Cari nama</label><Input id="cari-pegawai" v-model="cari" type="search" placeholder="Cari nama pegawai…" class="h-9 bg-card pl-9" /></div>
          <p class="text-sm text-muted-foreground"><strong class="font-semibold text-foreground tabular-nums">{{ jumlahAktif }}</strong> aktif dari {{ pegawai?.length ?? 0 }} pegawai</p>
        </div>
      </template>
      <div v-if="pending" class="p-4"><DashboardStateMemuat /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Daftar pegawai belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!pegawai?.length" class="p-4"><DashboardStateKosong judul="Belum ada pegawai terdaftar di kantor Anda." :ikon="Users"><Button @click="bukaDialog()"><UserPlus class="size-4" />Tambah pegawai</Button></DashboardStateKosong></div>
      <div v-else-if="!terlihat.length" class="p-4"><DashboardStateKosong judul="Tidak ada pegawai yang cocok dengan pencarian." ringkas /></div>
      <Table v-else class="min-w-[760px]">
        <TableHeader><TableRow><TableHead>{{ LABEL_FORM.nama }}</TableHead><TableHead>{{ LABEL_FORM.nip }}</TableHead><TableHead>Bertugas di</TableHead><TableHead>Status</TableHead><TableHead class="text-right"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow v-for="item in terlihat" :key="item.id" :class="item.aktif ? '' : 'text-muted-foreground'">
            <TableCell class="font-medium">{{ item.nama }}</TableCell>
            <TableCell class="font-mono text-xs">{{ item.nip || '—' }}</TableCell>
            <TableCell><div v-if="item.desa_binaan.length" class="flex flex-wrap gap-1"><span v-for="desa in item.desa_binaan" :key="desa" class="rounded-md bg-emas/15 px-2 py-0.5 text-xs font-medium text-emas-foreground">{{ desa }}</span></div><span v-else class="text-muted-foreground">—</span></TableCell>
            <TableCell><label class="inline-flex items-center gap-2 text-sm"><Switch :model-value="item.aktif" :disabled="sedangUbahStatus === item.id" @update:model-value="gantiAktif(item)" /><span :class="item.aktif ? 'font-medium text-sukses' : ''">{{ item.aktif ? 'Aktif' : 'Nonaktif' }}</span></label></TableCell>
            <TableCell class="text-right"><Button variant="ghost" size="sm" @click="bukaDialog(item)"><Pencil class="size-3.5" />Ubah</Button></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DashboardBingkaiTabel>
    <Dialog v-model:open="dialogTerbuka">
      <DialogContent>
        <DialogHeader><DialogTitle>{{ isian.id ? 'Ubah pegawai' : 'Tambah pegawai' }}</DialogTitle><DialogDescription>Nama harus unik di kantor Anda. NIP boleh dikosongkan.</DialogDescription></DialogHeader>
        <form id="form-pegawai" class="grid gap-4" @submit.prevent="simpan">
          <label class="grid gap-1.5 text-sm font-medium" for="nama-pegawai">{{ LABEL_FORM.nama }}<Input id="nama-pegawai" v-model="isian.nama" maxlength="150" required /></label>
          <label class="grid gap-1.5 text-sm font-medium" for="nip-pegawai">{{ LABEL_FORM.nip }} <span class="font-normal text-muted-foreground">(opsional)</span><Input id="nip-pegawai" v-model="isian.nip" maxlength="30" inputmode="numeric" /></label>
          <p v-if="pesanDialog" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesanDialog }}</p>
        </form>
        <DialogFooter><Button variant="outline" @click="dialogTerbuka = false">Batal</Button><Button type="submit" form="form-pegawai" :disabled="sibuk">{{ sibuk ? 'Menyimpan…' : 'Simpan' }}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
