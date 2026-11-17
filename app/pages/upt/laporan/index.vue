<script setup lang="ts">
import { ChevronRight, FileSearch, Inbox } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import type { ItemSegmen } from '~/components/dashboard/SegmenTab.vue'

definePageMeta({ layout: 'dashboard', title: 'Laporan Masyarakat' })
const route = useRoute()
const router = useRouter()

const bacaStatus = (nilai: unknown) => Array.isArray(nilai) ? nilai.filter((item): item is string => typeof item === 'string') : typeof nilai === 'string' ? [nilai] : []
const halaman = ref(Math.max(1, Number(route.query.halaman) || 1))
const filter = reactive({
  status: bacaStatus(route.query.status),
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
watch(filter, () => { halaman.value = 1 }, { deep: true })
watch(() => route.query, (query) => {
  filter.status = bacaStatus(query.status)
  filter.kelompok = typeof query.kelompok === 'string' ? query.kelompok : ''
  filter.terlambat = query.terlambat === 'true'
}, { deep: true })
watch(() => filter.status, (status) => { if (status.length) { filter.kelompok = ''; filter.terlambat = false } })

// Tab cepat (PRD 7.2) memakai parameter URL yang sama dengan kartu dashboard.
const TAB: (ItemSegmen & { query: Record<string, string> })[] = [
  { value: 'semua', label: 'Semua', query: {} },
  { value: 'perlu', label: 'Perlu ditanggapi', query: { status: 'diterima' } },
  { value: 'ditangani', label: 'Sedang ditangani', query: { kelompok: 'ditangani' } },
  { value: 'final', label: 'Selesai & ditolak', query: { kelompok: 'final' } },
  { value: 'terlambat', label: 'Terlambat', query: { terlambat: 'true' } }
]
const tabAktif = computed(() => {
  if (filter.terlambat) return 'terlambat'
  if (filter.kelompok === 'ditangani' || filter.kelompok === 'final') return filter.kelompok
  if (filter.status.length === 1 && filter.status[0] === 'diterima') return 'perlu'
  return filter.status.length ? '' : 'semua'
})
function pilihTab(value: string) {
  const tab = TAB.find(item => item.value === value)
  if (!tab) return
  // Diterapkan langsung juga, karena URL bisa sama dengan sebelumnya (mis. status dipilih lewat menu Status).
  Object.assign(filter, { status: tab.query.status ? [tab.query.status] : [], kelompok: tab.query.kelompok ?? '', terlambat: tab.query.terlambat === 'true' })
  void router.replace({ query: tab.query })
}

const adaFilter = computed(() => Boolean(filter.status.length || filter.kelompok || filter.terlambat || filter.jenis || filter.dari || filter.sampai || filter.cari))
function resetFilter() {
  Object.assign(filter, { status: [], kelompok: '', terlambat: false, jenis: '', dari: '', sampai: '', cari: '', urut: 'desc' })
  if (Object.keys(route.query).length) void router.replace({ query: {} })
}
const bukaDetail = (id: string) => navigateTo(`/upt/laporan/${id}`)
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Laporan Masyarakat" deskripsi="Laporan untuk kantor Anda. Nama dan alamat pelapor hanya tampil di halaman detail." />
    <DashboardSegmenTab :items="TAB" :aktif="tabAktif" label="Filter cepat laporan" @pilih="pilihTab" />

    <DashboardBingkaiTabel>
      <template #toolbar>
        <DashboardBilahFilterLaporan v-model:filter="filter" :aktif="adaFilter" :terlambat-nonaktif="Boolean(filter.status.length || filter.kelompok)" @reset="resetFilter" />
      </template>

      <div v-if="pending" class="p-4"><DashboardStateMemuat :baris="8" /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Daftar laporan belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!data?.data.length" class="p-4">
        <DashboardStateKosong :judul="adaFilter ? 'Tidak ada laporan yang cocok dengan filter.' : 'Belum ada laporan.'" :deskripsi="adaFilter ? 'Ubah atau hapus filter untuk melihat laporan lain.' : 'Laporan dari masyarakat di wilayah kantor Anda akan tampil di sini.'" :ikon="adaFilter ? FileSearch : Inbox">
          <Button v-if="adaFilter" variant="outline" @click="resetFilter">Reset filter</Button>
        </DashboardStateKosong>
      </div>
      <template v-else>
        <Table class="hidden min-w-[820px] md:table">
          <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Masuk</TableHead><TableHead>Desa</TableHead><TableHead>Kecamatan</TableHead><TableHead>Jenis</TableHead><TableHead>Status</TableHead><TableHead class="w-10"><span class="sr-only">Buka</span></TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="item in data.data" :key="item.id" class="group cursor-pointer" @click="bukaDetail(item.id)">
              <TableCell><NuxtLink :to="`/upt/laporan/${item.id}`" class="font-mono text-[0.8rem] font-semibold tracking-wide text-primary no-underline group-hover:underline" @click.stop>{{ item.kode_pelacakan }}</NuxtLink></TableCell>
              <TableCell class="text-muted-foreground"><DashboardWaktuRelatif :waktu="item.created_at" /></TableCell>
              <TableCell class="font-medium">{{ item.desa }}</TableCell>
              <TableCell class="text-muted-foreground">{{ item.kecamatan }}</TableCell>
              <TableCell><DashboardLencanaJenis :jenis="item.jenis_terlapor" /></TableCell>
              <TableCell><DashboardLencanaStatus :status="item.status" /></TableCell>
              <TableCell><ChevronRight class="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ul class="divide-y md:hidden">
          <li v-for="item in data.data" :key="item.id">
            <NuxtLink :to="`/upt/laporan/${item.id}`" class="grid gap-1.5 px-4 py-3.5 text-inherit no-underline active:bg-muted">
              <span class="flex items-center justify-between gap-3"><span class="font-mono text-sm font-semibold text-primary">{{ item.kode_pelacakan }}</span><DashboardLencanaStatus :status="item.status" /></span>
              <span class="text-sm">{{ item.desa }}, {{ item.kecamatan }}</span>
              <span class="flex items-center justify-between text-xs text-muted-foreground"><DashboardWaktuRelatif :waktu="item.created_at" /><DashboardLencanaJenis :jenis="item.jenis_terlapor" /></span>
            </NuxtLink>
          </li>
        </ul>
      </template>
      <template v-if="!pending && !error && data?.data.length" #footer><DashboardPaginasiTabel v-model="halaman" :total="data.total" /></template>
    </DashboardBingkaiTabel>
  </div>
</template>
