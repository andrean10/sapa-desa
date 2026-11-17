<script setup lang="ts">
import { Building2, ChevronRight, FileSearch, Inbox } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import type { ItemSegmen } from '~/components/dashboard/SegmenTab.vue'

definePageMeta({ layout: 'dashboard', title: 'Laporan masyarakat' })
const route = useRoute()
const { profil } = useAuth()
const bacaTeks = (nilai: unknown) => typeof nilai === 'string' ? nilai : ''
const bacaStatus = (nilai: unknown) => Array.isArray(nilai) ? nilai.filter((item): item is string => typeof item === 'string') : typeof nilai === 'string' ? [nilai] : []

const halaman = ref(1)
const kantorId = ref(bacaTeks(route.query.kantorId))
const filter = reactive({ status: bacaStatus(route.query.status), jenis: '', dari: bacaTeks(route.query.dari), sampai: bacaTeks(route.query.sampai), cari: '', terlambat: route.query.terlambat === 'true' })
const { data, pending, error, refresh } = await useDaftarLaporanKanwil(halaman, kantorId, filter)
watch(filter, () => { halaman.value = 1 }, { deep: true })
watch(kantorId, () => { halaman.value = 1 })

// Tab cepat setara dengan kelompok di halaman UPT, dinyatakan sebagai kumpulan status.
const TAB: (ItemSegmen & { status: string[]; terlambat?: boolean })[] = [
  { value: 'semua', label: 'Semua', status: [] },
  { value: 'perlu', label: 'Belum ditanggapi', status: ['diterima'] },
  { value: 'ditangani', label: 'Sedang ditangani', status: ['diverifikasi', 'ditindaklanjuti'] },
  { value: 'final', label: 'Selesai & ditolak', status: ['selesai', 'ditolak'] },
  { value: 'terlambat', label: 'Terlambat', status: [], terlambat: true }
]
const tabAktif = computed(() => {
  if (filter.terlambat && !filter.status.length) return 'terlambat'
  const kunci = [...filter.status].sort().join(',')
  return TAB.find(item => !item.terlambat && [...item.status].sort().join(',') === kunci)?.value ?? ''
})
function pilihTab(value: string) {
  const tab = TAB.find(item => item.value === value)
  if (tab) Object.assign(filter, { status: [...tab.status], terlambat: Boolean(tab.terlambat) })
}
const terlambatNonaktif = computed(() => filter.status.length > 0 && !filter.status.includes('diterima'))
watch(terlambatNonaktif, (nonaktif) => { if (nonaktif) filter.terlambat = false })

const adaFilter = computed(() => Boolean(filter.status.length || filter.jenis || filter.dari || filter.sampai || filter.cari || filter.terlambat || kantorId.value))
function resetFilter() { Object.assign(filter, { status: [], jenis: '', dari: '', sampai: '', cari: '', terlambat: false }); kantorId.value = '' }
const bukaDetail = (id: string) => navigateTo(`/kanwil/laporan/${id}`)
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Laporan masyarakat" :deskripsi="profil?.peran === 'admin' ? 'Laporan dari semua UPT. Admin dapat mengubah status di halaman detail.' : 'Laporan dari semua UPT. Kanwil hanya dapat membaca laporan.'" />
    <DashboardSegmenTab :items="TAB" :aktif="tabAktif" label="Filter cepat laporan" @pilih="pilihTab" />

    <DashboardBingkaiTabel>
      <template #toolbar>
        <DashboardBilahFilterLaporan v-model:filter="filter" :aktif="adaFilter" :terlambat-nonaktif="terlambatNonaktif" @reset="resetFilter">
          <template #awal>
            <div class="relative">
              <Building2 class="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <label for="filter-upt" class="sr-only">UPT</label>
              <NativeSelect id="filter-upt" v-model="kantorId" class="h-9 w-48 bg-card pl-8" :class="kantorId ? 'border-primary/50 text-primary' : ''">
                <NativeSelectOption value="">Semua UPT</NativeSelectOption>
                <NativeSelectOption v-for="item in data.kantor" :key="item.id" :value="item.id">{{ item.nama_singkat }}</NativeSelectOption>
              </NativeSelect>
            </div>
          </template>
        </DashboardBilahFilterLaporan>
      </template>

      <div v-if="pending" class="p-4"><DashboardStateMemuat :baris="8" /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Data laporan belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!data.data.length" class="p-4">
        <DashboardStateKosong :judul="adaFilter ? 'Tidak ada laporan yang cocok dengan filter.' : 'Belum ada laporan.'" :ikon="adaFilter ? FileSearch : Inbox">
          <Button v-if="adaFilter" variant="outline" @click="resetFilter">Reset filter</Button>
        </DashboardStateKosong>
      </div>
      <template v-else>
        <Table class="hidden min-w-[900px] md:table">
          <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Masuk</TableHead><TableHead>UPT</TableHead><TableHead>Lokasi</TableHead><TableHead>Jenis</TableHead><TableHead>Status</TableHead><TableHead class="w-10"><span class="sr-only">Buka</span></TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="item in data.data" :key="item.id" class="group cursor-pointer" @click="bukaDetail(item.id)">
              <TableCell><NuxtLink :to="`/kanwil/laporan/${item.id}`" class="font-mono text-[0.8rem] font-semibold tracking-wide text-primary no-underline group-hover:underline" @click.stop>{{ item.kode_pelacakan }}</NuxtLink></TableCell>
              <TableCell class="text-muted-foreground"><DashboardWaktuRelatif :waktu="item.created_at" /></TableCell>
              <TableCell class="font-medium">{{ item.kantor }}</TableCell>
              <TableCell><p>{{ item.desa }}</p><p class="text-xs text-muted-foreground">Kec. {{ item.kecamatan }}</p></TableCell>
              <TableCell><DashboardLencanaJenis :jenis="item.jenis_terlapor" /></TableCell>
              <TableCell><DashboardLencanaStatus :status="item.status" /></TableCell>
              <TableCell><ChevronRight class="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ul class="divide-y md:hidden">
          <li v-for="item in data.data" :key="item.id">
            <NuxtLink :to="`/kanwil/laporan/${item.id}`" class="grid gap-1.5 px-4 py-3.5 text-inherit no-underline active:bg-muted">
              <span class="flex items-center justify-between gap-3"><span class="font-mono text-sm font-semibold text-primary">{{ item.kode_pelacakan }}</span><DashboardLencanaStatus :status="item.status" /></span>
              <span class="text-sm"><strong class="font-medium">{{ item.kantor }}</strong> · {{ item.desa }}, {{ item.kecamatan }}</span>
              <span class="flex items-center justify-between text-xs text-muted-foreground"><DashboardWaktuRelatif :waktu="item.created_at" /><DashboardLencanaJenis :jenis="item.jenis_terlapor" /></span>
            </NuxtLink>
          </li>
        </ul>
      </template>
      <template v-if="!pending && !error && data.data.length" #footer><DashboardPaginasiTabel v-model="halaman" :total="data.total" /></template>
    </DashboardBingkaiTabel>
  </div>
</template>
