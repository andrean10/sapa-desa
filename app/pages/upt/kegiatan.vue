<script setup lang="ts">
import { formatTanggalWib, tanggalHariIniWib } from '~~/shared/utils/waktu'
definePageMeta({ layout: 'dashboard', title: 'Laporan Kegiatan' })
const { daftar, hapus } = useKegiatanUpt()
const { data, pending, error, refresh } = await daftar()
const pesan = ref('')
const bulan = ref(tanggalHariIniWib().slice(0, 7))
const desaDipilih = ref('')
const jenisDipilih = ref('')
const pegawaiDipilih = ref('')
const sekarang = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { sekarang.value = Date.now() }, 30_000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
const kegiatan = computed(() => data.value?.data ?? [])
const desaPilihan = computed(() => [...new Map(kegiatan.value.map(item => [item.desa_id, item.desa])).entries()])
const jenisPilihan = computed(() => [...new Map(kegiatan.value.map(item => [item.jenis_kegiatan_id, item.jenis])).entries()])
const pegawaiPilihan = computed(() => [...new Map(kegiatan.value.map(item => [item.pegawai_id, item.pegawai])).entries()])
const terlihat = computed(() => kegiatan.value.filter(item =>
  (!bulan.value || item.tanggal_kegiatan.startsWith(bulan.value)) &&
  (!desaDipilih.value || item.desa_id === desaDipilih.value) &&
  (!jenisDipilih.value || item.jenis_kegiatan_id === jenisDipilih.value) &&
  (!pegawaiDipilih.value || item.pegawai_id === pegawaiDipilih.value)
))
function sisaMenit(item: { created_at: string }) {
  return Math.max(0, Math.ceil((new Date(item.created_at).getTime() + (data.value?.batas_menit_hapus ?? 10) * 60_000 - sekarang.value) / 60_000))
}
async function konfirmasiHapus(id: string) {
  pesan.value = ''
  try { await hapus(id); await refresh() }
  catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Laporan kegiatan belum dapat dihapus.' }
}
</script>

<template>
  <section class="grid gap-5">
    <header class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-2xl font-extrabold text-primary">Laporan Kegiatan PIMPASA</h2><p class="mt-1 text-muted-foreground">Kegiatan di Desa Binaan Imigrasi.</p></div><NuxtLink class="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-bold text-white no-underline" to="/upt/kegiatan/baru">Buat laporan kegiatan</NuxtLink></header>
    <div class="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4"><label class="grid gap-1 text-sm font-semibold">Bulan<Input v-model="bulan" class="min-h-11 rounded-lg border border-border bg-background px-3" type="month" /></label><label class="grid gap-1 text-sm font-semibold">Desa<NativeSelect v-model="desaDipilih" class="min-h-11 rounded-lg border border-border bg-background px-3"><option value="">Semua desa</option><option v-for="[id, nama] in desaPilihan" :key="id" :value="id">{{ nama }}</option></NativeSelect></label><label class="grid gap-1 text-sm font-semibold">Jenis kegiatan<NativeSelect v-model="jenisDipilih" class="min-h-11 rounded-lg border border-border bg-background px-3"><option value="">Semua jenis</option><option v-for="[id, nama] in jenisPilihan" :key="id" :value="id">{{ nama }}</option></NativeSelect></label><label class="grid gap-1 text-sm font-semibold">Petugas<NativeSelect v-model="pegawaiDipilih" class="min-h-11 rounded-lg border border-border bg-background px-3"><option value="">Semua petugas</option><option v-for="[id, nama] in pegawaiPilihan" :key="id" :value="id">{{ nama }}</option></NativeSelect></label></div>
    <p v-if="pesan" class="rounded-lg bg-muted p-4 text-destructive" role="alert">{{ pesan }}</p>
    <p v-if="pending" role="status">Memuat laporan kegiatan...</p><div v-else-if="error" class="rounded-xl border border-border bg-card p-5" role="alert">Laporan kegiatan belum dapat dimuat. <Button variant="outline" type="button" @click="refresh()">Coba lagi</Button></div><p v-else-if="!terlihat.length" class="rounded-xl border border-border bg-card p-6 text-muted-foreground">{{ kegiatan.length ? 'Tidak ada laporan yang cocok dengan filter.' : 'Belum ada laporan kegiatan bulan ini.' }}</p>
    <div v-else class="overflow-x-auto rounded-xl border border-border bg-card shadow-card"><Table class="w-full min-w-[980px] text-left text-sm"><TableHeader class="bg-muted"><TableRow><TableHead class="p-4">Tanggal</TableHead><TableHead class="p-4">Desa</TableHead><TableHead class="p-4">Jenis kegiatan</TableHead><TableHead class="p-4">Peserta</TableHead><TableHead class="p-4">Petugas</TableHead><TableHead class="p-4">Lampiran</TableHead><TableHead class="p-4">Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in terlihat" :key="item.id" class="border-t border-border"><TableCell class="p-4">{{ formatTanggalWib(item.tanggal_kegiatan) }}</TableCell><TableCell class="p-4">{{ item.desa }}</TableCell><TableCell class="p-4">{{ item.jenis }}</TableCell><TableCell class="p-4">{{ item.jumlah_peserta }}</TableCell><TableCell class="p-4">{{ item.pegawai }}<span v-if="item.petugas_pengganti" class="ml-2 rounded-full bg-muted px-2 py-1 text-xs">Digantikan</span></TableCell><TableCell class="p-4"><span v-if="item.foto_path" class="mr-2 rounded-full bg-muted px-2 py-1 text-xs">Foto</span><span v-if="item.pdf_path" class="rounded-full bg-muted px-2 py-1 text-xs">PDF</span><span v-if="!item.foto_path && !item.pdf_path" class="text-muted-foreground">—</span></TableCell><TableCell class="p-4"><div class="grid justify-items-start gap-1"><div class="flex gap-2"><NuxtLink class="inline-flex min-h-9 items-center rounded-lg px-3 font-semibold text-primary underline" :to="`/upt/kegiatan/${item.id}`">Ubah</NuxtLink><AlertDialog v-if="sisaMenit(item) > 0"><AlertDialogTrigger as-child><Button variant="destructive" size="sm" type="button">Hapus</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus laporan kegiatan?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction @click="konfirmasiHapus(item.id)">Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div><span v-if="sisaMenit(item) > 0" class="text-xs text-muted-foreground">Dapat dihapus {{ sisaMenit(item) }} menit lagi</span></div></TableCell></TableRow></TableBody></Table></div>
  </section>
</template>
