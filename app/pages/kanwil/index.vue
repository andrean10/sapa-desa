<script setup lang="ts">
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, CircleCheckBig, FileInput, Hourglass, Inbox, TriangleAlert } from '@lucide/vue'
import type { BarisUptKanwil, TrenKanwil } from '~/composables/useKanwil'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { formatAngkaIndonesia } from '~~/shared/utils/angka'
import type { ModePeriode } from '~~/shared/utils/waktu'
import { rentangPeriode, tanggalHariIniWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Dashboard Kanwil' })
const router = useRouter()
const hariIni = tanggalHariIniWib()
const modePeriode = ref<ModePeriode>('bulan_ini')
const kustom = ref({ mulai: `${hariIni.slice(0, 7)}-01`, selesai: hariIni })
const periode = computed(() => rentangPeriode(modePeriode.value, kustom.value, hariIni))
const { data, pending, error, refresh } = await useDashboardKanwil(periode)
const tren = computed(() => data.value?.tren as TrenKanwil | null)
const memuatAwal = computed(() => pending.value && !data.value?.ringkasan)

const kartuUtama = computed(() => {
  const r = data.value?.ringkasan
  if (!r) return []
  return [
    { label: 'Laporan masuk', nilai: r.laporan_masuk, ikon: FileInput, nada: 'netral' as const, keterangan: 'Dalam periode terpilih', ke: `/kanwil/laporan?dari=${periode.value.mulai}&sampai=${periode.value.selesai}` },
    { label: 'Belum ditanggapi', nilai: r.belum_ditanggapi, ikon: Inbox, nada: 'info' as const, keterangan: 'Status Diterima', ke: '/kanwil/laporan?status=diterima' },
    { label: 'Terlambat', nilai: r.terlambat, ikon: TriangleAlert, nada: r.terlambat > 0 ? 'bahaya' as const : 'netral' as const, keterangan: `Lebih dari ${r.batas_hari} hari kerja`, ke: '/kanwil/pantauan' },
    { label: 'Sedang ditangani', nilai: r.sedang_ditangani, ikon: Hourglass, nada: 'netral' as const, keterangan: 'Diverifikasi & ditindaklanjuti', ke: '/kanwil/laporan?status=diverifikasi&status=ditindaklanjuti' }
  ]
})
const statPendukung = computed(() => {
  const r = data.value?.ringkasan
  if (!r) return []
  return [
    { label: 'Selesai', nilai: formatAngkaIndonesia(r.selesai_periode), warna: 'text-sukses' },
    { label: 'Ditolak', nilai: formatAngkaIndonesia(r.ditolak_periode), warna: 'text-destructive' },
    { label: 'Kegiatan PIMPASA', nilai: formatAngkaIndonesia(r.kegiatan_periode), warna: 'text-foreground' },
    { label: 'PIMPASA aktif', nilai: formatAngkaIndonesia(r.pimpasa_aktif), warna: 'text-foreground' }
  ]
})
const persenDesaTanpaKegiatan = computed(() => {
  const r = data.value?.ringkasan
  return r && r.desa_binaan ? Math.round(r.desa_tanpa_kegiatan / r.desa_binaan * 100) : 0
})

const KOLOM: { key: keyof BarisUptKanwil; label: string; angka: boolean }[] = [
  { key: 'kantor', label: 'UPT', angka: false },
  { key: 'laporan_masuk', label: 'Laporan masuk', angka: true },
  { key: 'belum_ditanggapi', label: 'Belum ditanggapi', angka: true },
  { key: 'terlambat', label: 'Terlambat', angka: true },
  { key: 'sedang_ditangani', label: 'Ditangani', angka: true },
  { key: 'direspon', label: 'Direspon', angka: true },
  { key: 'kegiatan', label: 'Kegiatan', angka: true },
  { key: 'desa_binaan', label: 'Desa binaan', angka: true },
  { key: 'desa_tanpa_kegiatan', label: 'Tanpa kegiatan', angka: true }
]
const urutKolom = ref<keyof BarisUptKanwil>('terlambat')
const arahTurun = ref(true)
function urutkan(kolom: keyof BarisUptKanwil) {
  if (urutKolom.value === kolom) arahTurun.value = !arahTurun.value
  else { urutKolom.value = kolom; arahTurun.value = kolom !== 'kantor' }
}
const barisUpt = computed(() => [...(data.value?.perUpt ?? [])].sort((a, b) => {
  const x = a[urutKolom.value]
  const y = b[urutKolom.value]
  const hasil = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y, 'id') : Number(x) - Number(y)
  return arahTurun.value ? -hasil : hasil
}))
const maksLaporan = computed(() => Math.max(1, ...barisUpt.value.map(item => item.laporan_masuk)))
const terlambatDari = (item: { hari_kerja_berjalan: number | null; batas_hari: number | null }) => Math.max(0, (item.hari_kerja_berjalan ?? 0) - (item.batas_hari ?? data.value?.ringkasan?.batas_hari ?? 0))
</script>

<template>
  <div class="grid gap-6">
    <DashboardKepalaHalaman judul="Ringkasan wilayah" deskripsi="Pantau respons laporan masyarakat dan kegiatan PIMPASA di seluruh UPT Riau.">
      <template #aksi><DashboardFilterPeriode v-model:mode="modePeriode" v-model:kustom="kustom" /></template>
    </DashboardKepalaHalaman>

    <div v-if="memuatAwal" class="grid gap-6" role="status">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Skeleton v-for="i in 4" :key="i" class="h-34 rounded-xl" /></div>
      <Skeleton class="h-24 rounded-xl" /><Skeleton class="h-80 rounded-xl" />
      <span class="sr-only">Memuat dashboard…</span>
    </div>
    <DashboardStateGalat v-else-if="error && !data?.ringkasan" pesan="Dashboard belum dapat dimuat." @coba="refresh()" />
    <div v-else-if="data?.ringkasan" class="grid gap-6 transition-opacity" :class="pending ? 'opacity-60' : ''" :aria-busy="pending">
      <section class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Indikator utama">
        <DashboardKartuAngka v-for="item in kartuUtama" :key="item.label" v-bind="item" />
      </section>

      <section class="grid overflow-hidden rounded-xl border bg-card shadow-xs sm:grid-cols-2 lg:grid-cols-5" aria-label="Indikator pendukung">
        <div v-for="item in statPendukung" :key="item.label" class="border-b px-5 py-4 sm:border-r lg:border-b-0">
          <p class="text-xs font-medium text-muted-foreground">{{ item.label }}</p>
          <p class="mt-1 text-2xl font-semibold tabular-nums" :class="item.warna">{{ item.nilai }}</p>
        </div>
        <div class="px-5 py-4 sm:col-span-2 lg:col-span-1">
          <p class="text-xs font-medium text-muted-foreground">Desa tanpa kegiatan</p>
          <p class="mt-1 text-2xl font-semibold tabular-nums" :class="data.ringkasan.desa_tanpa_kegiatan ? 'text-peringatan' : 'text-foreground'">{{ data.ringkasan.desa_tanpa_kegiatan }}<span class="text-base font-normal text-muted-foreground"> / {{ data.ringkasan.desa_binaan }}</span></p>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="img" :aria-label="`${persenDesaTanpaKegiatan} persen desa binaan tanpa kegiatan`"><div class="h-full rounded-full bg-emas" :style="{ width: `${persenDesaTanpaKegiatan}%` }" /></div>
        </div>
      </section>

      <DashboardKartuBagian judul="Kinerja per UPT" deskripsi="Klik baris untuk membuka dashboard UPT. Klik judul kolom untuk mengurutkan." rapat>
        <DashboardBingkaiTabel polos>
          <Table class="min-w-[880px]">
            <TableHeader>
              <TableRow>
                <TableHead v-for="kolom in KOLOM" :key="kolom.key" :class="kolom.angka ? 'text-right' : ''" :aria-sort="urutKolom === kolom.key ? (arahTurun ? 'descending' : 'ascending') : 'none'">
                  <button type="button" class="inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" :class="urutKolom === kolom.key ? 'text-foreground' : ''" @click="urutkan(kolom.key)">
                    {{ kolom.label }}<ArrowDown v-if="urutKolom === kolom.key && arahTurun" class="size-3.5" /><ArrowUp v-else-if="urutKolom === kolom.key" class="size-3.5" /><ArrowUpDown v-else class="size-3.5 opacity-40" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in barisUpt" :key="item.kantor_id" class="group cursor-pointer" @click="router.push(`/kanwil/upt/${item.kantor_id}`)">
                <TableCell><NuxtLink class="inline-flex items-center gap-1 font-medium text-foreground no-underline group-hover:text-primary" :to="`/kanwil/upt/${item.kantor_id}`" @click.stop>{{ item.kantor }}<ChevronRight class="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" /></NuxtLink></TableCell>
                <TableCell class="text-right"><div class="flex items-center justify-end gap-2"><div class="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted xl:block" aria-hidden="true"><div class="h-full rounded-full bg-chart-2" :style="{ width: `${item.laporan_masuk / maksLaporan * 100}%` }" /></div><span class="w-8 font-semibold tabular-nums">{{ item.laporan_masuk }}</span></div></TableCell>
                <TableCell class="text-right tabular-nums">{{ item.belum_ditanggapi }}</TableCell>
                <TableCell class="text-right"><span v-if="item.terlambat" class="inline-flex min-w-7 justify-center rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-white tabular-nums">{{ item.terlambat }}</span><span v-else class="text-muted-foreground tabular-nums">0</span></TableCell>
                <TableCell class="text-right tabular-nums">{{ item.sedang_ditangani }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ item.direspon }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ item.kegiatan }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ item.desa_binaan }}</TableCell>
                <TableCell class="text-right"><span class="tabular-nums" :class="item.desa_tanpa_kegiatan ? 'font-semibold text-peringatan' : 'text-muted-foreground'">{{ item.desa_tanpa_kegiatan }}</span></TableCell>
              </TableRow>
              <TableRow v-if="!barisUpt.length"><TableCell :colspan="KOLOM.length" class="py-10 text-center text-muted-foreground">Belum ada data UPT.</TableCell></TableRow>
            </TableBody>
          </Table>
        </DashboardBingkaiTabel>
      </DashboardKartuBagian>

      <section class="grid gap-4 lg:grid-cols-3" aria-label="Tren">
        <DashboardKartuBagian class="lg:col-span-2" judul="Tren laporan masyarakat" deskripsi="Enam bulan hingga akhir periode, WNA dan WNI.">
          <DashboardGrafikBulanan :data="tren?.laporan_per_bulan ?? []" :seri="[{ key: 'wna', label: 'WNA', warna: 'var(--chart-1)' }, { key: 'wni', label: 'WNI', warna: 'var(--chart-3)' }]" label="Laporan per bulan" />
        </DashboardKartuBagian>
        <DashboardKartuBagian judul="Komposisi laporan" deskripsi="Proporsi WNA dan WNI dalam periode.">
          <DashboardGrafikKomposisi :wna="tren?.proporsi?.wna ?? 0" :wni="tren?.proporsi?.wni ?? 0" />
        </DashboardKartuBagian>
        <DashboardKartuBagian class="lg:col-span-2" judul="Kegiatan PIMPASA per bulan" deskripsi="Enam bulan hingga akhir periode.">
          <DashboardGrafikBulanan :data="tren?.kegiatan_per_bulan ?? []" :seri="[{ key: 'total', label: 'Kegiatan', warna: 'var(--chart-2)' }]" label="Kegiatan per bulan" />
        </DashboardKartuBagian>
        <DashboardKartuBagian judul="Kegiatan per jenis" deskripsi="Dalam periode terpilih.">
          <DashboardBatangMendatar v-if="tren?.kegiatan_per_jenis?.length" :items="tren.kegiatan_per_jenis.map(item => ({ label: item.jenis, nilai: item.jumlah }))" />
          <DashboardStateKosong v-else judul="Belum ada data kegiatan." ringkas />
        </DashboardKartuBagian>
      </section>

      <DashboardKartuBagian judul="Pantauan laporan terlambat" deskripsi="Lima kasus tertua yang belum ditanggapi melewati batas." rapat>
        <template #aksi><Button variant="outline" size="sm" as-child><NuxtLink to="/kanwil/pantauan" class="no-underline">Lihat semua<ChevronRight class="size-4" /></NuxtLink></Button></template>
        <div v-if="!data.pantauan.length" class="border-t p-5"><DashboardStateKosong judul="Tidak ada laporan terlambat." deskripsi="Semua UPT menanggapi laporan sesuai batas waktu." :ikon="CircleCheckBig" ringkas /></div>
        <ul v-else class="divide-y border-t">
          <li v-for="(item, index) in data.pantauan" :key="item.id ?? index">
            <NuxtLink :to="`/kanwil/laporan/${item.id}`" class="flex flex-col gap-2 px-5 py-3.5 text-inherit no-underline transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0">
                <p class="flex flex-wrap items-center gap-2"><span class="font-mono text-sm font-semibold text-primary">{{ item.kode_pelacakan }}</span><DashboardLencanaJenis :jenis="item.jenis_terlapor" /><span class="text-sm font-medium">{{ item.kantor }}</span></p>
                <p class="mt-0.5 truncate text-sm text-muted-foreground">{{ item.desa }}, {{ item.kecamatan }}, {{ item.kabupaten }}</p>
              </div>
              <DashboardLencanaBatas :sisa="-terlambatDari(item)" />
            </NuxtLink>
          </li>
        </ul>
      </DashboardKartuBagian>
    </div>
  </div>
</template>
