<script setup lang="ts">
import { Building2, CalendarDays, ChevronRight, FileSearch, FileText, Image, X } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { formatTanggalWib, tanggalHariIniWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Laporan kegiatan PIMPASA' })
const route = useRoute()
const hariIni = tanggalHariIniWib()
const awalBulan = `${hariIni.slice(0, 7)}-01`
const halaman = ref(1)
const kantorId = ref(typeof route.query.kantorId === 'string' ? route.query.kantorId : '')
const filter = reactive({ hanyaDiganti: false, dari: awalBulan, sampai: hariIni, desaId: '', jenisId: '', pegawaiId: '' })
const { data, pending, error, refresh } = await useDaftarKegiatanKanwil(halaman, kantorId, filter)
watch(filter, () => { halaman.value = 1 }, { deep: true })
watch(kantorId, () => { halaman.value = 1 })
const adaFilter = computed(() => Boolean(kantorId.value || filter.hanyaDiganti || filter.desaId || filter.jenisId || filter.pegawaiId || filter.dari !== awalBulan || filter.sampai !== hariIni))
// Reset kembali ke bawaan PRD 7.4: bulan berjalan.
function resetFilter() { Object.assign(filter, { hanyaDiganti: false, dari: awalBulan, sampai: hariIni, desaId: '', jenisId: '', pegawaiId: '' }); kantorId.value = '' }
const bukaDetail = (id: string) => navigateTo(`/kanwil/kegiatan/${id}`)
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Kegiatan PIMPASA" deskripsi="Laporan kegiatan di desa binaan dari seluruh UPT. Hanya baca untuk Kanwil dan admin." />

    <DashboardBingkaiTabel>
      <template #toolbar>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <Building2 class="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label for="filter-upt" class="sr-only">UPT</label>
            <NativeSelect id="filter-upt" v-model="kantorId" class="h-9 w-48 bg-card pl-8"><NativeSelectOption value="">Semua UPT</NativeSelectOption><NativeSelectOption v-for="item in data.kantor" :key="item.id" :value="item.id">{{ item.nama_singkat }}</NativeSelectOption></NativeSelect>
          </div>
          <div class="flex items-center gap-1.5 rounded-md border bg-card pr-1 pl-2.5 shadow-xs">
            <span class="text-xs text-muted-foreground">Tanggal</span>
            <label for="filter-dari" class="sr-only">Dari tanggal</label>
            <input id="filter-dari" v-model="filter.dari" type="date" :max="filter.sampai || hariIni" class="h-8 w-32 bg-transparent text-sm outline-none">
            <span class="text-muted-foreground">–</span>
            <label for="filter-sampai" class="sr-only">Sampai tanggal</label>
            <input id="filter-sampai" v-model="filter.sampai" type="date" :min="filter.dari" :max="hariIni" class="h-8 w-32 bg-transparent text-sm outline-none">
          </div>
          <label for="filter-desa" class="sr-only">Desa</label>
          <NativeSelect id="filter-desa" v-model="filter.desaId" class="h-9 w-40 bg-card"><NativeSelectOption value="">Semua desa</NativeSelectOption><NativeSelectOption v-for="item in data.pilihan.desa" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect>
          <label for="filter-jenis" class="sr-only">Jenis kegiatan</label>
          <NativeSelect id="filter-jenis" v-model="filter.jenisId" class="h-9 w-44 bg-card"><NativeSelectOption value="">Semua jenis</NativeSelectOption><NativeSelectOption v-for="item in data.pilihan.jenis" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect>
          <label for="filter-petugas" class="sr-only">Petugas</label>
          <NativeSelect id="filter-petugas" v-model="filter.pegawaiId" class="h-9 w-40 bg-card"><NativeSelectOption value="">Semua petugas</NativeSelectOption><NativeSelectOption v-for="item in data.pilihan.pegawai" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect>
          <label class="flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 text-sm shadow-xs"><Checkbox v-model="filter.hanyaDiganti" />Hanya yang digantikan</label>
          <Button v-if="adaFilter" variant="ghost" class="h-9 text-muted-foreground" @click="resetFilter"><X class="size-4" />Reset</Button>
        </div>
      </template>

      <div v-if="pending" class="p-4"><DashboardStateMemuat :baris="8" /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Daftar kegiatan belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!data.data.length" class="p-4">
        <DashboardStateKosong judul="Belum ada laporan kegiatan pada rentang terpilih." :ikon="adaFilter ? FileSearch : CalendarDays"><Button v-if="adaFilter" variant="outline" @click="resetFilter">Reset filter</Button></DashboardStateKosong>
      </div>
      <template v-else>
        <Table class="hidden min-w-[980px] md:table">
          <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>UPT</TableHead><TableHead>Desa</TableHead><TableHead>Jenis kegiatan</TableHead><TableHead class="text-right">Peserta</TableHead><TableHead>Petugas</TableHead><TableHead>Lampiran</TableHead><TableHead class="w-10"><span class="sr-only">Buka</span></TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="item in data.data" :key="item.id" class="group cursor-pointer" @click="bukaDetail(item.id)">
              <TableCell class="whitespace-nowrap font-medium"><NuxtLink :to="`/kanwil/kegiatan/${item.id}`" class="text-foreground no-underline group-hover:text-primary" @click.stop>{{ formatTanggalWib(item.tanggal_kegiatan) }}</NuxtLink></TableCell>
              <TableCell>{{ item.kantor }}</TableCell>
              <TableCell>{{ item.desa }}</TableCell>
              <TableCell><span class="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{{ item.jenis }}</span></TableCell>
              <TableCell class="text-right tabular-nums">{{ item.jumlah_peserta }}</TableCell>
              <TableCell><div class="flex flex-wrap items-center gap-2"><span>{{ item.pegawai }}</span><span v-if="item.petugas_pengganti_nama" class="rounded-full bg-peringatan-muda px-2 py-0.5 text-xs font-semibold text-peringatan">Digantikan</span></div><p v-if="item.petugas_pengganti_nama" class="mt-0.5 text-xs text-muted-foreground">Pengganti: {{ item.petugas_pengganti_nama }}</p></TableCell>
              <TableCell><div class="flex gap-1.5"><span v-if="item.jumlah_foto" class="inline-flex size-7 items-center justify-center rounded-md bg-info-muda text-info" :title="`${item.jumlah_foto} foto`"><Image class="size-3.5" /><span class="sr-only">Foto</span></span><span v-if="item.ada_pdf" class="inline-flex size-7 items-center justify-center rounded-md bg-bahaya-muda text-destructive" title="PDF"><FileText class="size-3.5" /><span class="sr-only">PDF</span></span><span v-if="!item.jumlah_foto && !item.ada_pdf" class="text-muted-foreground">—</span></div></TableCell>
              <TableCell><ChevronRight class="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ul class="divide-y md:hidden">
          <li v-for="item in data.data" :key="item.id">
            <NuxtLink :to="`/kanwil/kegiatan/${item.id}`" class="grid gap-1 px-4 py-3.5 text-inherit no-underline active:bg-muted">
              <span class="flex items-center justify-between gap-2"><span class="font-medium">{{ item.desa }}</span><span class="text-xs text-muted-foreground">{{ formatTanggalWib(item.tanggal_kegiatan) }}</span></span>
              <span class="text-sm text-muted-foreground">{{ item.kantor }} · {{ item.jenis }}</span>
              <span class="text-xs text-muted-foreground">{{ item.pegawai }}<template v-if="item.petugas_pengganti_nama"> · <strong class="text-peringatan">Digantikan oleh {{ item.petugas_pengganti_nama }}</strong></template></span>
            </NuxtLink>
          </li>
        </ul>
      </template>
      <template v-if="!pending && !error && data.data.length" #footer><DashboardPaginasiTabel v-model="halaman" :total="data.total" /></template>
    </DashboardBingkaiTabel>
  </div>
</template>
