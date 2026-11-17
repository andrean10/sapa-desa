<script setup lang="ts">
import { STATUS_LAPORAN, JENIS_TERLAPOR } from '~~/shared/config/teks'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
definePageMeta({ layout: 'dashboard', title: 'Laporan masyarakat' })
const route = useRoute()
const halaman = ref(1)
const kantorId = ref(typeof route.query.kantorId === 'string' ? route.query.kantorId : '')
const filter = reactive({ status: [] as string[], jenis: '', dari: '', sampai: '', cari: '', terlambat: false })
const { data, pending, error, refresh } = await useDaftarLaporanKanwil(halaman, kantorId, filter)
const totalHalaman = computed(() => Math.max(1, Math.ceil(data.value.total / 20)))
watch(filter, () => { halaman.value = 1 }, { deep: true })
watch(kantorId, () => { halaman.value = 1 })
function toggleStatus(status: string, aktif: boolean | 'indeterminate') {
  if (aktif && !filter.status.includes(status)) filter.status.push(status)
  if (!aktif) filter.status = filter.status.filter(value => value !== status)
}
function resetFilter() { Object.assign(filter, { status: [], jenis: '', dari: '', sampai: '', cari: '', terlambat: false }); kantorId.value = '' }
</script>

<template>
  <div class="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 sm:gap-6">
    <header class="flex min-w-0 flex-col gap-4 border-l-2 border-accent py-1 pl-4 sm:flex-row sm:items-end sm:justify-between"><div class="min-w-0 space-y-1"><p class="text-sm font-semibold text-muted-foreground">Pelayanan masyarakat</p><h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Laporan masyarakat</h1><p class="max-w-3xl text-sm leading-6 text-muted-foreground">Pantau laporan semua UPT. Kanwil hanya dapat membaca laporan; admin dapat mengubah status di detail.</p></div><label class="grid w-full gap-2 text-sm font-medium sm:w-56">Filter UPT<NativeSelect v-model="kantorId"><NativeSelectOption value="">Semua UPT</NativeSelectOption><NativeSelectOption v-for="item in data.kantor" :key="item.id" :value="item.id">{{ item.nama_singkat }}</NativeSelectOption></NativeSelect></label></header>
    <Card><CardHeader><CardTitle>Filter laporan</CardTitle><CardDescription>Status, jenis terlapor, tanggal masuk, atau kata kunci.</CardDescription></CardHeader><CardContent class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><fieldset class="grid gap-2 text-sm sm:col-span-2"><legend class="mb-2 font-medium">Status (bisa pilih beberapa)</legend><div class="flex flex-wrap gap-x-4 gap-y-2"><label v-for="item in STATUS_LAPORAN" :key="item.value" class="flex items-center gap-2"><Checkbox :model-value="filter.status.includes(item.value)" @update:model-value="value => toggleStatus(item.value, value)" />{{ item.label }}</label></div></fieldset><label class="grid gap-1.5 text-sm font-medium">Jenis terlapor<NativeSelect v-model="filter.jenis"><NativeSelectOption value="">WNA dan WNI</NativeSelectOption><NativeSelectOption v-for="item in JENIS_TERLAPOR" :key="item.value" :value="item.value">{{ item.label }}</NativeSelectOption></NativeSelect></label><label class="grid gap-1.5 text-sm font-medium">Dari tanggal<Input v-model="filter.dari" type="date" /></label><label class="grid gap-1.5 text-sm font-medium">Sampai tanggal<Input v-model="filter.sampai" type="date" :min="filter.dari" /></label><label class="grid gap-1.5 text-sm font-medium sm:col-span-2">Cari kode, desa, atau kecamatan<Input v-model="filter.cari" type="search" maxlength="100" placeholder="Contoh: SD-7KQ2 atau Pekanbaru" /></label><label class="flex items-center gap-2 self-end text-sm"><Checkbox v-model="filter.terlambat" :disabled="filter.status.length > 0 && !filter.status.includes('diterima')" />Terlambat saja</label><Button class="w-fit self-end" variant="outline" @click="resetFilter">Reset filter</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Semua laporan</CardTitle><CardDescription>{{ data.total }} laporan · terbaru lebih dulu</CardDescription></CardHeader><CardContent><div v-if="pending" class="grid gap-3"><Skeleton v-for="i in 6" :key="i" class="h-12 w-full" /></div><div v-else-if="error" class="grid gap-3 text-sm text-destructive" role="alert">Data laporan belum dapat dimuat.<Button class="w-fit" variant="outline" @click="refresh()">Coba lagi</Button></div><template v-else><div class="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Kode pelacakan</TableHead><TableHead>Masuk</TableHead><TableHead>UPT</TableHead><TableHead>Kabupaten/Kota</TableHead><TableHead>Desa</TableHead><TableHead>Jenis</TableHead><TableHead>Status</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data.data" :key="item.id"><TableCell class="font-mono font-semibold">{{ item.kode_pelacakan }}</TableCell><TableCell>{{ formatTanggalWaktuWib(item.created_at) }}</TableCell><TableCell>{{ item.kantor }}</TableCell><TableCell>{{ item.kecamatan }}</TableCell><TableCell>{{ item.desa }}</TableCell><TableCell>{{ item.jenis_terlapor.toUpperCase() }}</TableCell><TableCell><StatusBadge :status="item.status" /></TableCell><TableCell><NuxtLink class="font-medium underline-offset-4 hover:underline" :to="`/kanwil/laporan/${item.id}`">Detail</NuxtLink></TableCell></TableRow><TableEmpty v-if="!data.data.length" :colspan="8">{{ filter.status.length || filter.jenis || filter.dari || filter.sampai || filter.cari || filter.terlambat || kantorId ? 'Tidak ada laporan yang cocok dengan filter.' : 'Belum ada laporan.' }}</TableEmpty></TableBody></Table></div><nav class="mt-4 flex items-center justify-between" aria-label="Paginasi"><Button variant="outline" :disabled="halaman <= 1" @click="halaman--">Sebelumnya</Button><span class="text-sm text-muted-foreground">Halaman {{ halaman }} dari {{ totalHalaman }}</span><Button variant="outline" :disabled="halaman >= totalHalaman" @click="halaman++">Berikutnya</Button></nav></template></CardContent></Card>
  </div>
</template>
