<script setup lang="ts">
import { LABEL_FORM } from '~~/shared/config/teks'
definePageMeta({ layout: 'dashboard', title: 'Pegawai' })
const { daftar, tambah, ubah } = usePegawaiUpt()
const { data: pegawai, pending, error, refresh } = await daftar()
const nama = ref('')
const nip = ref('')
const cari = ref('')
const pesan = ref('')
const sibuk = ref(false)
const editId = ref('')
const editNama = ref('')
const editNip = ref('')
const terlihat = computed(() => (pegawai.value ?? []).filter(item => item.nama.toLocaleLowerCase('id').includes(cari.value.trim().toLocaleLowerCase('id'))))

async function simpanBaru() {
  sibuk.value = true; pesan.value = ''
  try { await tambah(nama.value, nip.value); nama.value = ''; nip.value = ''; await refresh() }
  catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Pegawai belum dapat ditambahkan.' }
  finally { sibuk.value = false }
}
async function gantiAktif(id: string, aktif: boolean) {
  pesan.value = ''
  try { await ubah(id, { aktif }); await refresh() }
  catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Status pegawai belum dapat diubah.' }
}
function mulaiUbah(item: { id: string; nama: string; nip: string | null }) {
  editId.value = item.id; editNama.value = item.nama; editNip.value = item.nip ?? ''; pesan.value = ''
}
async function simpanUbah() {
  if (!editId.value || !editNama.value.trim()) return
  try { await ubah(editId.value, { nama: editNama.value, nip: editNip.value || null }); editId.value = ''; await refresh() }
  catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Data pegawai belum dapat diubah.' }
}
function batalUbah() { editId.value = '' }
</script>

<template>
  <section class="grid gap-5">
    <header><h2 class="text-2xl font-extrabold text-primary">Pegawai kantor</h2><p class="mt-1 text-muted-foreground">Kelola daftar petugas yang dapat dipilih saat bertugas.</p></header>
    <form class="grid gap-3 rounded-xl border border-border bg-card p-5 shadow-card md:grid-cols-[1fr_1fr_auto] md:items-end" @submit.prevent="simpanBaru"><label class="grid gap-2 font-semibold" for="nama-pegawai">{{ LABEL_FORM.nama }}<Input id="nama-pegawai" v-model="nama" maxlength="150" required /></label><label class="grid gap-2 font-semibold" for="nip-pegawai">{{ LABEL_FORM.nip }} (opsional)<Input id="nip-pegawai" v-model="nip" maxlength="30" /></label><Button type="submit" :disabled="sibuk">Tambah pegawai</Button></form>
    <p v-if="pesan" class="rounded-lg bg-muted p-4 text-destructive" role="alert">{{ pesan }}</p>
    <label class="grid max-w-md gap-2 font-semibold" for="cari-pegawai">Cari nama<Input id="cari-pegawai" v-model="cari" class="min-h-11 rounded-lg border border-border bg-card px-3 text-base" type="search" /></label>
    <p v-if="pending" role="status">Memuat pegawai...</p><div v-else-if="error" class="rounded-xl border border-border bg-card p-5" role="alert">Daftar pegawai belum dapat dimuat. <Button variant="outline" type="button" @click="refresh()">Coba lagi</Button></div>
    <div v-else-if="!pegawai?.length" class="rounded-xl border border-border bg-card p-6 text-muted-foreground">Belum ada pegawai terdaftar di kantor Anda.</div>
    <div v-else-if="!terlihat.length" class="rounded-xl border border-border bg-card p-6 text-muted-foreground">Tidak ada pegawai yang cocok dengan pencarian.</div>
    <div v-else class="overflow-x-auto rounded-xl border border-border bg-card shadow-card"><Table class="w-full min-w-[760px] text-left text-sm"><TableHeader class="bg-muted"><TableRow><TableHead class="p-4">Nama</TableHead><TableHead class="p-4">NIP</TableHead><TableHead class="p-4">Status</TableHead><TableHead class="p-4">Bertugas di</TableHead><TableHead class="p-4">Aksi</TableHead></TableRow></TableHeader><TableBody>
      <TableRow v-for="item in terlihat" :key="item.id" class="border-t border-border">
        <template v-if="editId === item.id"><TableCell class="p-3"><input v-model="editNama" class="min-h-10 w-full rounded-lg border border-border bg-background px-3" aria-label="Nama pegawai"></TableCell><TableCell class="p-3"><input v-model="editNip" class="min-h-10 w-full rounded-lg border border-border bg-background px-3" aria-label="NIP"></TableCell><TableCell class="p-4">{{ item.aktif ? 'Aktif' : 'Nonaktif' }}</TableCell><TableCell class="p-4">{{ item.desa_binaan.join(', ') || '—' }}</TableCell><TableCell class="p-3"><div class="flex gap-2"><Button size="sm" type="button" @click="simpanUbah">Simpan</Button><Button variant="outline" size="sm" type="button" @click="batalUbah">Batal</Button></div></TableCell></template>
        <template v-else><TableCell class="p-4 font-semibold">{{ item.nama }}</TableCell><TableCell class="p-4">{{ item.nip || '—' }}</TableCell><TableCell class="p-4">{{ item.aktif ? 'Aktif' : 'Nonaktif' }}</TableCell><TableCell class="p-4"><span v-for="desa in item.desa_binaan" :key="desa" class="mr-1 inline-block rounded-full bg-muted px-2 py-1 text-xs">{{ desa }}</span><span v-if="!item.desa_binaan.length" class="text-muted-foreground">—</span></TableCell><TableCell class="p-4"><div class="flex gap-2"><Button variant="ghost" size="sm" type="button" @click="mulaiUbah(item)">Ubah</Button><Button :variant="item.aktif ? 'destructive' : 'secondary'" size="sm" type="button" @click="gantiAktif(item.id, !item.aktif)">{{ item.aktif ? 'Nonaktifkan' : 'Aktifkan' }}</Button></div></TableCell></template>
      </TableRow>
    </TableBody></Table></div>
  </section>
</template>
