<script setup lang="ts">
import { STATUS_LAPORAN, JENIS_TERLAPOR } from '~~/shared/config/teks'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Laporan Masyarakat' })
const route = useRoute()
const halaman = ref(Math.max(1, Number(route.query.halaman) || 1))
const filter = reactive({
  status: Array.isArray(route.query.status) ? route.query.status.filter((item): item is string => typeof item === 'string') : typeof route.query.status === 'string' ? [route.query.status] : [],
  kelompok: typeof route.query.kelompok === 'string' ? route.query.kelompok : '',
  terlambat: route.query.terlambat === 'true',
  jenis: '',
  dari: '',
  sampai: '',
  cari: '',
  urut: 'desc'
})
const { daftar } = useLaporanUpt()
const { data, pending, error, refresh } = await daftar(halaman, filter)
const totalHalaman = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / 20)))
watch(filter, () => { halaman.value = 1 }, { deep: true })
watch(() => route.query, (query) => {
  filter.status = Array.isArray(query.status) ? query.status.filter((item): item is string => typeof item === 'string') : typeof query.status === 'string' ? [query.status] : []
  filter.kelompok = typeof query.kelompok === 'string' ? query.kelompok : ''
  filter.terlambat = query.terlambat === 'true'
}, { deep: true })
watch(() => filter.status, (status) => { if (status.length) { filter.kelompok = ''; filter.terlambat = false } })
function resetFilter() {
  Object.assign(filter, { status: [], kelompok: '', terlambat: false, jenis: '', dari: '', sampai: '', cari: '', urut: 'desc' })
}
function ubahStatusFilter(status: string, aktif: boolean | 'indeterminate') {
  if (aktif && !filter.status.includes(status)) filter.status.push(status)
  if (!aktif) filter.status = filter.status.filter(item => item !== status)
}
</script>

<template>
  <section class="grid gap-5">
    <header><h2 class="text-2xl font-extrabold text-primary">Laporan Masyarakat</h2><p class="mt-1 text-muted-foreground">Daftar laporan untuk kantor Anda. Nama dan alamat hanya tersedia di detail.</p></header>
    <nav class="flex flex-wrap gap-2" aria-label="Filter cepat"><NuxtLink v-for="item in [{ label: 'Semua', href: '/upt/laporan' }, { label: 'Perlu ditanggapi', href: '/upt/laporan?status=diterima' }, { label: 'Sedang ditangani', href: '/upt/laporan?kelompok=ditangani' }, { label: 'Selesai dan ditolak', href: '/upt/laporan?kelompok=final' }, { label: 'Terlambat', href: '/upt/laporan?terlambat=true' }]" :key="item.href" class="rounded-full border border-border px-4 py-2 text-sm font-semibold no-underline" :class="route.fullPath === item.href ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'" :to="item.href">{{ item.label }}</NuxtLink></nav>
    <div class="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
      <fieldset class="grid gap-2 text-sm font-semibold"><legend>Status (dapat pilih beberapa)</legend><div class="flex flex-wrap gap-x-3 gap-y-2"> <label v-for="item in STATUS_LAPORAN" :key="item.value" class="flex items-center gap-2 font-normal"><Checkbox :model-value="filter.status.includes(item.value)" @update:model-value="aktif => ubahStatusFilter(item.value, aktif)" />{{ item.label }}</label></div></fieldset>
      <label class="grid gap-1 text-sm font-semibold">Jenis terlapor<NativeSelect v-model="filter.jenis" class="min-h-11 rounded-lg border border-border bg-background px-3"><option value="">WNA dan WNI</option><option v-for="item in JENIS_TERLAPOR" :key="item.value" :value="item.value">{{ item.label }}</option></NativeSelect></label>
      <label class="grid gap-1 text-sm font-semibold">Dari tanggal<Input v-model="filter.dari" class="min-h-11 rounded-lg border border-border bg-background px-3" type="date" /></label>
      <label class="grid gap-1 text-sm font-semibold">Sampai tanggal<Input v-model="filter.sampai" class="min-h-11 rounded-lg border border-border bg-background px-3" type="date" /></label>
      <label class="grid gap-1 text-sm font-semibold sm:col-span-2">Cari kode, desa, atau kecamatan<Input v-model="filter.cari" class="min-h-11 rounded-lg border border-border bg-background px-3" type="search" maxlength="100" placeholder="Contoh: SD-7KQ2 atau Pekanbaru" @change="halaman = 1" /></label>
      <label class="grid gap-1 text-sm font-semibold">Urut masuk<NativeSelect v-model="filter.urut" class="min-h-11 rounded-lg border border-border bg-background px-3"><option value="desc">Terbaru dulu</option><option value="asc">Terlama dulu</option></NativeSelect></label>
      <label class="flex min-h-11 items-center gap-2 self-end rounded-lg border border-border bg-background px-3 text-sm font-semibold"><Checkbox v-model="filter.terlambat" :disabled="Boolean(filter.status.length || filter.kelompok)" />Terlambat saja</label>
      <Button class="justify-self-start xl:col-start-4" variant="outline" type="button" @click="resetFilter">Reset filter</Button>
    </div>
    <p v-if="pending" class="rounded-xl border border-border bg-card p-5 text-muted-foreground" role="status">Memuat laporan...</p>
    <div v-else-if="error" class="rounded-xl border border-border bg-card p-5" role="alert"><p>Daftar laporan belum dapat dimuat.</p><Button class="mt-3" variant="outline" type="button" @click="refresh()">Coba lagi</Button></div>
    <div v-else-if="!data?.data.length" class="rounded-xl border border-border bg-card p-6 text-muted-foreground">{{ filter.status.length || filter.kelompok || filter.terlambat || filter.jenis || filter.dari || filter.sampai || filter.cari ? 'Tidak ada laporan yang cocok dengan filter.' : 'Belum ada laporan.' }}<Button v-if="filter.status.length || filter.kelompok || filter.terlambat || filter.jenis || filter.dari || filter.sampai || filter.cari" class="ml-3" variant="outline" type="button" @click="resetFilter">Reset filter</Button></div>
    <template v-else>
      <div class="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-card md:block">
        <Table class="w-full min-w-[900px] text-left text-sm"><TableHeader class="bg-muted text-foreground"><TableRow><TableHead class="p-4">Kode</TableHead><TableHead class="p-4">Masuk</TableHead><TableHead class="p-4">Desa</TableHead><TableHead class="p-4">Kecamatan</TableHead><TableHead class="p-4">Jenis</TableHead><TableHead class="p-4">Status</TableHead><TableHead class="p-4"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data.data" :key="item.id" class="border-t border-border"><TableCell class="p-4 font-bold tracking-wider text-primary">{{ item.kode_pelacakan }}</TableCell><TableCell class="p-4">{{ formatTanggalWaktuWib(item.created_at) }}</TableCell><TableCell class="p-4">{{ item.desa }}</TableCell><TableCell class="p-4">{{ item.kecamatan }}</TableCell><TableCell class="p-4">{{ item.jenis_terlapor.toUpperCase() }}</TableCell><TableCell class="p-4"><StatusBadge :status="item.status" /></TableCell><TableCell class="p-4"><NuxtLink class="font-semibold text-primary underline" :to="`/upt/laporan/${item.id}`">Buka detail</NuxtLink></TableCell></TableRow></TableBody></Table>
      </div>
      <ul class="grid gap-3 md:hidden"><li v-for="item in data.data" :key="item.id" class="rounded-xl border border-border bg-card p-4 shadow-card"><div class="flex items-start justify-between gap-3"><strong class="font-mono tracking-wider text-primary">{{ item.kode_pelacakan }}</strong><StatusBadge :status="item.status" /></div><p class="mt-2 text-sm">{{ item.desa }}, {{ item.kecamatan }}</p><p class="mt-1 text-sm text-muted-foreground">{{ item.jenis_terlapor.toUpperCase() }} · {{ formatTanggalWaktuWib(item.created_at) }}</p><NuxtLink class="mt-3 inline-block font-semibold text-primary underline" :to="`/upt/laporan/${item.id}`">Buka detail</NuxtLink></li></ul>
      <nav class="flex items-center justify-between" aria-label="Paginasi"><Button variant="outline" type="button" :disabled="halaman <= 1" @click="halaman--">Sebelumnya</Button><span class="text-sm text-muted-foreground">Halaman {{ halaman }} dari {{ totalHalaman }}</span><Button variant="outline" type="button" :disabled="halaman >= totalHalaman" @click="halaman++">Berikutnya</Button></nav>
    </template>
  </section>
</template>
