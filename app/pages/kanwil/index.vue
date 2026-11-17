<script setup lang="ts">
import { VisAxis, VisStackedBar, VisXYContainer } from '@unovis/vue'
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, ChevronRight } from '@lucide/vue'
import type { BarisUptKanwil, TrenKanwil } from '~/composables/useKanwil'
import { formatTanggalWib, tanggalHariIniWib } from '~~/shared/utils/waktu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'

definePageMeta({ layout: 'dashboard', title: 'Dashboard Kanwil' })
const modePeriode = ref<'bulan_ini' | 'bulan_lalu' | 'tahun_ini' | 'kustom'>('bulan_ini')
const hariIni = tanggalHariIniWib()
const mulaiKustom = ref(`${hariIni.slice(0, 7)}-01`)
const selesaiKustom = ref(hariIni)
function batasBulan(geser: number) {
  const tahun = Number(hariIni.slice(0, 4))
  const bulan = Number(hariIni.slice(5, 7))
  const tanggal = new Date(Date.UTC(tahun, bulan - 1 + geser, 1))
  const awal = `${tanggal.getUTCFullYear()}-${String(tanggal.getUTCMonth() + 1).padStart(2, '0')}-01`
  const akhirTanggal = new Date(Date.UTC(tanggal.getUTCFullYear(), tanggal.getUTCMonth() + 1, 0)).getUTCDate()
  const akhir = `${awal.slice(0, 7)}-${String(akhirTanggal).padStart(2, '0')}`
  return { mulai: awal, selesai: geser === 0 ? hariIni : akhir }
}
const periode = computed(() => modePeriode.value === 'bulan_ini' ? batasBulan(0) : modePeriode.value === 'bulan_lalu' ? batasBulan(-1) : modePeriode.value === 'tahun_ini' ? { mulai: `${hariIni.slice(0, 4)}-01-01`, selesai: hariIni } : { mulai: mulaiKustom.value, selesai: selesaiKustom.value })
const { data, pending, error, refresh } = await useDashboardKanwil(periode)
const tren = computed(() => data.value?.tren as TrenKanwil | null)
const kartu = computed(() => {
  const item = data.value?.ringkasan
  if (!item) return []
  return [
    { label: 'Laporan masuk', nilai: item.laporan_masuk },
    { label: 'Belum ditanggapi', nilai: item.belum_ditanggapi },
    { label: 'Terlambat', nilai: item.terlambat, bahaya: item.terlambat > 0 },
    { label: 'Sedang ditangani', nilai: item.sedang_ditangani },
    { label: 'Selesai', nilai: item.selesai_periode },
    { label: 'Ditolak', nilai: item.ditolak_periode },
    { label: 'Kegiatan PIMPASA', nilai: item.kegiatan_periode },
    { label: 'Desa tanpa kegiatan', nilai: `${item.desa_tanpa_kegiatan}/${item.desa_binaan}` },
    { label: 'PIMPASA aktif', nilai: item.pimpasa_aktif }
  ]
})
const kartuUtama = computed(() => kartu.value.slice(0, 4))
const kartuPendukung = computed(() => kartu.value.slice(4))
const urutKolom = ref('terlambat')
const arahTurun = ref(true)
function urutkan(kolom: keyof BarisUptKanwil) {
  if (urutKolom.value === kolom) arahTurun.value = !arahTurun.value
  else { urutKolom.value = kolom; arahTurun.value = true }
}
const barisUpt = computed(() => [...(data.value?.perUpt ?? [])].sort((a, b) => {
  const x = a[urutKolom.value as keyof BarisUptKanwil]
  const y = b[urutKolom.value as keyof BarisUptKanwil]
  const hasil = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y, 'id') : Number(x) - Number(y)
  return arahTurun.value ? -hasil : hasil
}))
const tanggalBulan = (nilai: string) => new Date(`${nilai.slice(0, 7)}-01T00:00:00+07:00`).getTime()
const xLaporan = (item: NonNullable<TrenKanwil['laporan_per_bulan']>[number]) => tanggalBulan(item.bulan)
const yWna = (item: NonNullable<TrenKanwil['laporan_per_bulan']>[number]) => item.wna
const yWni = (item: NonNullable<TrenKanwil['laporan_per_bulan']>[number]) => item.wni
const xKegiatan = (item: NonNullable<TrenKanwil['kegiatan_per_bulan']>[number]) => tanggalBulan(item.bulan)
const yKegiatan = (item: NonNullable<TrenKanwil['kegiatan_per_bulan']>[number]) => item.total
const labelBulan = (nilai: number) => new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(nilai))
const periodeLabel = computed(() => `${formatTanggalWib(`${periode.value.mulai}T00:00:00+07:00`)} – ${formatTanggalWib(`${periode.value.selesai}T00:00:00+07:00`)}`)
</script>

<template>
  <div class="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 sm:gap-6">
    <section class="relative flex min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-xl border border-primary bg-primary p-4 text-primary-foreground shadow-sm sm:p-6 xl:flex-row xl:items-end">
      <div class="min-w-0"><p class="text-sm font-semibold text-primary-foreground/70">Pantauan kinerja wilayah</p><h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Ringkasan Kanwil</h1><p class="mt-1 text-sm text-primary-foreground/75">{{ periodeLabel }}</p></div>
      <div class="flex flex-wrap items-end gap-3"><label class="grid gap-1.5 text-sm font-medium">Periode<NativeSelect v-model="modePeriode" class="min-w-40 bg-card text-foreground"><NativeSelectOption value="bulan_ini">Bulan ini</NativeSelectOption><NativeSelectOption value="bulan_lalu">Bulan lalu</NativeSelectOption><NativeSelectOption value="tahun_ini">Tahun ini</NativeSelectOption><NativeSelectOption value="kustom">Rentang bebas</NativeSelectOption></NativeSelect></label><template v-if="modePeriode === 'kustom'"><label class="grid gap-1.5 text-sm font-medium">Dari<input v-model="mulaiKustom" class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" type="date" :max="selesaiKustom"></label><label class="grid gap-1.5 text-sm font-medium">Sampai<input v-model="selesaiKustom" class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" type="date" :min="mulaiKustom" :max="hariIni"></label></template><Button variant="outline" size="icon" class="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" aria-label="Muat ulang dashboard" @click="refresh()"><CalendarDays class="size-4" /></Button></div>
    </section>
    <div v-if="pending" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Card v-for="i in 9" :key="i"><CardHeader class="gap-3"><Skeleton class="h-4 w-32" /><Skeleton class="h-8 w-16" /></CardHeader></Card></div>
    <Card v-else-if="error" role="alert"><CardHeader><CardTitle>Dashboard belum dapat dimuat</CardTitle><CardDescription>Periksa koneksi, lalu coba lagi.</CardDescription></CardHeader><CardContent><Button variant="outline" @click="refresh()">Coba lagi</Button></CardContent></Card>
    <template v-else-if="data?.ringkasan">
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indikator utama"><Card v-for="item in kartuUtama" :key="item.label" class="border-t-2" :class="item.bahaya ? 'border-t-destructive' : 'border-t-primary'"><CardHeader class="gap-2 pb-3"><CardDescription>{{ item.label }}</CardDescription><CardTitle class="text-3xl font-bold tabular-nums tracking-tight" :class="item.bahaya ? 'text-destructive' : 'text-primary'">{{ item.nilai }}</CardTitle></CardHeader></Card></section>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Indikator pendukung"><Card v-for="item in kartuPendukung" :key="item.label" class="gap-3 py-4"><CardHeader class="gap-1 pb-0"><CardDescription>{{ item.label }}</CardDescription><CardTitle class="text-2xl font-semibold tabular-nums">{{ item.nilai }}</CardTitle></CardHeader></Card></section>
      <Card><CardHeader><CardTitle>Kinerja per UPT</CardTitle><CardDescription>Perbandingan laporan, respons, kegiatan, dan desa binaan dalam periode terpilih.</CardDescription></CardHeader><CardContent><div class="overflow-x-auto"><Table><TableHeader><TableRow><TableHead v-for="[key, label] in [['kantor','UPT'],['laporan_masuk','Laporan masuk'],['belum_ditanggapi','Belum ditanggapi'],['terlambat','Terlambat'],['sedang_ditangani','Sedang ditangani'],['direspon','Direspon'],['kegiatan','Kegiatan'],['desa_binaan','Desa binaan'],['desa_tanpa_kegiatan','Desa tanpa kegiatan']]" :key="key"><Button variant="ghost" size="sm" class="-ml-3 h-8 font-medium" @click="urutkan(key as keyof BarisUptKanwil)">{{ label }}<ArrowDown v-if="urutKolom === key && arahTurun" class="ml-1 size-3.5" /><ArrowUp v-else-if="urutKolom === key" class="ml-1 size-3.5" /><ArrowUpDown v-else class="ml-1 size-3.5 opacity-40" /></Button></TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in barisUpt" :key="item.kantor_id" class="cursor-pointer hover:bg-muted/60"><TableCell><NuxtLink class="font-medium text-foreground underline-offset-4 hover:underline" :to="`/kanwil/upt/${item.kantor_id}`">{{ item.kantor }}<ChevronRight class="ml-1 inline size-4 text-muted-foreground" /></NuxtLink></TableCell><TableCell>{{ item.laporan_masuk }}</TableCell><TableCell>{{ item.belum_ditanggapi }}</TableCell><TableCell><Badge v-if="item.terlambat" variant="destructive">{{ item.terlambat }}</Badge><span v-else>0</span></TableCell><TableCell>{{ item.sedang_ditangani }}</TableCell><TableCell>{{ item.direspon }}</TableCell><TableCell>{{ item.kegiatan }}</TableCell><TableCell>{{ item.desa_binaan }}</TableCell><TableCell>{{ item.desa_tanpa_kegiatan }}</TableCell></TableRow><TableEmpty v-if="!barisUpt.length" :colspan="9">Belum ada data UPT.</TableEmpty></TableBody></Table></div></CardContent></Card>
      <section class="grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Tren laporan masyarakat</CardTitle><CardDescription>Enam bulan hingga akhir periode. WNA dan WNI ditampilkan terpisah.</CardDescription></CardHeader><CardContent><ClientOnly><ChartContainer class="min-h-64" :config="{ wna: { label: 'WNA', color: 'var(--chart-1)' }, wni: { label: 'WNI', color: 'var(--chart-3)' } }" label="Grafik laporan per bulan, WNA dan WNI"><VisXYContainer :data="tren?.laporan_per_bulan ?? []" :height="250"><VisStackedBar :x="xLaporan" :y="[yWna, yWni]" :color="['var(--chart-1)', 'var(--chart-3)']" :rounded-corners="4" :bar-padding="0.2" /><VisAxis type="x" :x="xLaporan" :tick-format="labelBulan" :tick-line="false" :domain-line="false" /><VisAxis type="y" :tick-line="false" :domain-line="false" /></VisXYContainer></ChartContainer><template #fallback><Skeleton class="h-56 w-full" /></template></ClientOnly></CardContent></Card><Card><CardHeader><CardTitle>Kegiatan PIMPASA per bulan</CardTitle><CardDescription>Aktivitas yang tercatat dalam enam bulan terakhir periode.</CardDescription></CardHeader><CardContent><ClientOnly><ChartContainer class="min-h-64" :config="{ kegiatan: { label: 'Kegiatan', color: 'var(--chart-2)' } }" label="Grafik laporan kegiatan PIMPASA"><VisXYContainer :data="tren?.kegiatan_per_bulan ?? []" :height="250"><VisStackedBar :x="xKegiatan" :y="[yKegiatan]" :color="['var(--chart-2)']" :rounded-corners="4" :bar-padding="0.2" /><VisAxis type="x" :x="xKegiatan" :tick-format="labelBulan" :tick-line="false" :domain-line="false" /><VisAxis type="y" :tick-line="false" :domain-line="false" /></VisXYContainer></ChartContainer><template #fallback><Skeleton class="h-56 w-full" /></template></ClientOnly></CardContent></Card></section>
      <section class="grid gap-4 xl:grid-cols-[1fr_1.4fr]"><Card><CardHeader><CardTitle>Komposisi laporan</CardTitle><CardDescription>WNA {{ tren?.proporsi?.wna ?? 0 }}% · WNI {{ tren?.proporsi?.wni ?? 0 }}%</CardDescription></CardHeader><CardContent><div class="grid grid-cols-2 gap-3"><div class="rounded-lg border p-4"><p class="text-sm text-muted-foreground">WNA</p><p class="mt-1 text-2xl font-semibold">{{ tren?.proporsi?.wna ?? 0 }}%</p></div><div class="rounded-lg border p-4"><p class="text-sm text-muted-foreground">WNI</p><p class="mt-1 text-2xl font-semibold">{{ tren?.proporsi?.wni ?? 0 }}%</p></div></div></CardContent></Card><Card><CardHeader><CardTitle>Kegiatan per jenis</CardTitle><CardDescription>Jumlah kegiatan PIMPASA dalam periode terpilih.</CardDescription></CardHeader><CardContent><ul v-if="tren?.kegiatan_per_jenis?.length" class="grid gap-3 sm:grid-cols-2"><li v-for="item in tren.kegiatan_per_jenis" :key="item.jenis" class="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"><span class="text-sm">{{ item.jenis }}</span><Badge variant="secondary">{{ item.jumlah }}</Badge></li></ul><p v-else class="text-sm text-muted-foreground">Belum ada data kegiatan dalam periode ini.</p></CardContent></Card></section>
      <Card><CardHeader class="flex-row items-center justify-between"><div><CardTitle>Pantauan laporan terlambat</CardTitle><CardDescription>Kasus tertua yang perlu perhatian Kanwil.</CardDescription></div><Button as-child variant="outline" size="sm"><NuxtLink to="/kanwil/pantauan">Lihat semua<ChevronRight class="ml-1 size-4" /></NuxtLink></Button></CardHeader><CardContent><ul v-if="data.pantauan.length" class="divide-y"> <li v-for="(item, index) in data.pantauan" :key="item.id ?? item.kode_pelacakan ?? index" class="flex flex-wrap items-center justify-between gap-3 py-3"><div><p class="font-mono text-sm font-semibold">{{ item.kode_pelacakan }}</p><p class="mt-1 text-sm text-muted-foreground">{{ item.kantor }} · {{ item.desa }}, {{ item.kecamatan }}, {{ item.kabupaten }}</p></div><Badge variant="destructive">Terlambat {{ Math.max(0, (item.hari_kerja_berjalan ?? 0) - (item.batas_hari ?? data.ringkasan.batas_hari)) }} hari kerja</Badge></li></ul><p v-else class="text-sm text-muted-foreground">Tidak ada laporan terlambat.</p></CardContent></Card>
    </template>
  </div>
</template>
