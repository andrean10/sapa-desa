<script setup lang="ts">
import { VisAxis, VisDonut, VisSingleContainer, VisStackedBar, VisXYContainer } from '@unovis/vue'
import { AMBANG_DESA_LAMA_HARI } from '~~/shared/config/app'
import { TEKS_UMUM } from '~~/shared/config/teks'
import { formatTanggalWib, tanggalHariIniWib } from '~~/shared/utils/waktu'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Skeleton } from '~/components/ui/skeleton'
import { Progress } from '~/components/ui/progress'

definePageMeta({ layout: 'dashboard', title: 'Dashboard UPT' })
const modePeriode = ref('bulan_ini')
const mulaiKustom = ref('')
const selesaiKustom = ref(tanggalHariIniWib())
const periode = computed(() => {
  const hariIni = tanggalHariIniWib()
  if (modePeriode.value === 'kustom') return { mulai: mulaiKustom.value, selesai: selesaiKustom.value }
  if (modePeriode.value === 'bulan_ini') return { mulai: `${hariIni.slice(0, 7)}-01`, selesai: hariIni }
  const tahun = Number(hariIni.slice(0, 4))
  const bulan = Number(hariIni.slice(5, 7))
  return { mulai: new Date(Date.UTC(tahun, bulan - 6, 1)).toISOString().slice(0, 10), selesai: hariIni }
})
const { data, pending, error, refresh } = await useDashboardUpt(periode)
const kartu = computed(() => {
  const ringkasan = data.value?.ringkasan
  if (!ringkasan) return []
  return [
    { label: 'Perlu ditanggapi', nilai: ringkasan.perlu_ditanggapi, href: '/upt/laporan?status=diterima' },
    { label: 'Sedang ditangani', nilai: ringkasan.sedang_ditangani, href: '/upt/laporan?kelompok=ditangani' },
    { label: 'Terlambat', nilai: ringkasan.terlambat, href: '/upt/laporan?terlambat=true', merah: ringkasan.terlambat > 0 },
    { label: 'Selesai atau ditolak bulan ini', nilai: ringkasan.selesai_ditolak_bulan_ini, href: '/upt/laporan?kelompok=final' },
    { label: 'Kegiatan PIMPASA bulan ini', nilai: ringkasan.kegiatan_bulan_ini, href: '/upt/kegiatan' }
  ]
})
type TrenUpt = {
  laporan_per_bulan?: { bulan: string; total: number; wna: number; wni: number }[]
  proporsi?: { wna: number; wni: number }
  kegiatan_per_jenis?: { jenis: string; jumlah: number }[]
  kandidat_dbi?: { desa_id: string; desa: string; kecamatan: string; jumlah: number }[]
}
const tren = computed(() => data.value?.tren as TrenUpt | null)
const nilaiMaksJenis = computed(() => Math.max(1, ...(tren.value?.kegiatan_per_jenis ?? []).map(item => item.jumlah)))
type TitikLaporan = { bulan: string; total: number; wna: number; wni: number; tanggal: number }
const dataGrafikLaporan = computed<TitikLaporan[]>(() => (tren.value?.laporan_per_bulan ?? []).map(item => ({
  ...item,
  tanggal: new Date(`${item.bulan.slice(0, 7)}-01T00:00:00+07:00`).getTime()
})))
const kegiatanPerJenis = computed(() => tren.value?.kegiatan_per_jenis ?? [])
const kandidatDbi = computed(() => tren.value?.kandidat_dbi ?? [])
const proporsiWna = computed(() => tren.value?.proporsi?.wna ?? 0)
const proporsiWni = computed(() => tren.value?.proporsi?.wni ?? 0)
const dataDonat = computed(() => [{ jenis: 'WNA', jumlah: proporsiWna.value, warna: 'var(--chart-1)' }, { jenis: 'WNI', jumlah: proporsiWni.value, warna: 'var(--chart-3)' }])
const formatBulanGrafik = (nilai: number) => new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(nilai))
const ambilTanggalGrafik = (item: TitikLaporan) => item.tanggal
const ambilWna = (item: TitikLaporan) => item.wna
const ambilWni = (item: TitikLaporan) => item.wni
const ambilJumlahDonat = (item: { jumlah: number }) => item.jumlah
const ambilWarnaDonat = (item: { warna: string }) => item.warna
</script>

<template>
  <div class="grid gap-6">
    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" role="status"><div v-for="n in 5" :key="n" class="rounded-xl border bg-card p-5"><Skeleton class="h-4 w-24" /><Skeleton class="mt-5 h-8 w-16" /></div><span class="sr-only">{{ TEKS_UMUM.memuat }}</span></div>
    <div v-else-if="error" class="rounded-xl border border-border bg-card p-6" role="alert"><p>Ringkasan dashboard belum dapat dimuat.</p><Button class="mt-3" variant="outline" type="button" @click="refresh()">{{ TEKS_UMUM.cobaLagi }}</Button></div>
    <template v-else>
      <section class="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-card p-4" aria-label="Periode tren">
        <div><h2 class="font-bold text-primary">Tren UPT</h2><p class="text-sm text-muted-foreground">Pilih periode untuk komposisi laporan, kegiatan, dan kandidat DBI.</p></div>
        <div class="flex flex-wrap items-end gap-3"><label class="grid gap-1 text-sm font-semibold">Periode<NativeSelect v-model="modePeriode" class="min-h-11 bg-background"><NativeSelectOption value="bulan_ini">Bulan ini</NativeSelectOption><NativeSelectOption value="enam_bulan">6 bulan terakhir</NativeSelectOption><NativeSelectOption value="kustom">Kustom</NativeSelectOption></NativeSelect></label><label v-if="modePeriode === 'kustom'" class="grid gap-1 text-sm font-semibold">Dari<Input v-model="mulaiKustom" type="date" class="min-h-11 rounded-lg border border-border bg-background px-3" /></label><label v-if="modePeriode === 'kustom'" class="grid gap-1 text-sm font-semibold">Sampai<Input v-model="selesaiKustom" type="date" :max="tanggalHariIniWib()" class="min-h-11 rounded-lg border border-border bg-background px-3" /></label></div>
      </section>
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Ringkasan laporan"><Card v-for="item in kartu" :key="item.label" class="transition hover:border-primary"><NuxtLink class="block h-full text-inherit no-underline" :to="item.href"><CardHeader><CardDescription>{{ item.label }}</CardDescription><CardTitle as="h3" class="mt-2 text-3xl font-black" :class="item.merah ? 'text-destructive' : 'text-primary'">{{ item.nilai }}</CardTitle><p v-if="item.merah && data?.ringkasan" class="text-xs text-destructive">Lebih dari {{ data.ringkasan.batas_hari }} hari kerja</p></CardHeader></NuxtLink></Card></section>
      <section class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-xl font-extrabold text-primary">Perlu tindakan</h2><p class="mt-1 text-sm text-muted-foreground">Laporan diterima yang menunggu tanggapan.</p></div><NuxtLink class="font-bold text-primary underline" to="/upt/laporan">Lihat semua</NuxtLink></div><p v-if="!data?.tindakan.length" class="mt-5 rounded-lg bg-muted p-4 text-muted-foreground">Tidak ada laporan yang perlu ditanggapi.</p><ul v-else class="mt-4 divide-y divide-border"><li v-for="item in data.tindakan" :key="item.laporan_id" class="flex flex-wrap items-center justify-between gap-4 py-4"><div><p class="font-bold tracking-wider text-primary">{{ item.kode_pelacakan }}</p><p class="mt-1 text-sm text-muted-foreground">{{ item.desa }}, {{ item.kecamatan }} · {{ item.jenis_terlapor.toUpperCase() }} · {{ formatTanggalWib(item.masuk_pada) }}</p><p class="mt-1 text-sm" :class="item.sisa_hari_kerja < 0 ? 'font-bold text-destructive' : 'text-muted-foreground'">{{ item.sisa_hari_kerja < 0 ? `Terlambat ${Math.abs(item.sisa_hari_kerja)} hari kerja` : `Sisa ${item.sisa_hari_kerja} hari kerja` }}</p></div><NuxtLink class="min-h-10 content-center rounded-lg bg-primary px-4 font-semibold text-white no-underline" :to="`/upt/laporan/${item.laporan_id}`">Tinjau</NuxtLink></li></ul></section>
      <section class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"><h2 class="text-xl font-extrabold text-primary">Desa binaan</h2><p v-if="!data?.desa.length" class="mt-4 text-muted-foreground">Belum ada desa binaan di wilayah kantor.</p><ul v-else class="mt-4 grid gap-3 md:grid-cols-2"><li v-for="item in data.desa" :key="item.desa_id" class="rounded-lg border border-border p-4" :class="item.kegiatan_terakhir ? '' : 'bg-accent/20'"><p class="flex flex-wrap items-center gap-2 font-bold text-primary">{{ item.desa }}<span v-if="item.hari_sejak_kegiatan != null && item.hari_sejak_kegiatan > AMBANG_DESA_LAMA_HARI" class="rounded-full bg-accent/30 px-2 py-1 text-xs text-foreground">Belum dikunjungi {{ item.hari_sejak_kegiatan }} hari</span></p><p class="mt-1 text-sm text-muted-foreground">{{ item.kecamatan }}, {{ item.kabupaten }}</p><p class="mt-2 text-sm">PIMPASA: {{ item.petugas || 'Belum ada petugas' }}</p><p class="mt-1 text-sm text-muted-foreground">Kegiatan terakhir: {{ item.kegiatan_terakhir ? formatTanggalWib(item.kegiatan_terakhir) : 'Belum pernah' }}<span v-if="item.hari_sejak_kegiatan != null"> · {{ item.hari_sejak_kegiatan }} hari lalu</span></p><p class="mt-1 text-sm text-muted-foreground">Kegiatan bulan ini: {{ item.kegiatan_bulan_ini }}</p><NuxtLink class="mt-3 inline-block font-semibold text-primary underline" :to="`/upt/kegiatan/baru?desa=${item.desa_id}`">Buat laporan kegiatan</NuxtLink></li></ul></section>
      <section v-if="tren" class="grid gap-5 lg:grid-cols-2" aria-label="Grafik tren UPT">
        <div class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"><h2 class="text-lg font-bold text-primary">Laporan per bulan</h2><ClientOnly><ChartContainer class="mt-5 min-h-56" :config="{ wna: { label: 'WNA', color: 'var(--chart-1)' }, wni: { label: 'WNI', color: 'var(--chart-3)' } }" label="Grafik batang bertumpuk jumlah laporan WNA dan WNI per bulan"><VisXYContainer :data="dataGrafikLaporan" :height="220"><VisStackedBar :x="ambilTanggalGrafik" :y="[ambilWna, ambilWni]" :color="['var(--chart-1)', 'var(--chart-3)']" :rounded-corners="4" :bar-padding="0.2" /><VisAxis type="x" :x="ambilTanggalGrafik" :tick-format="formatBulanGrafik" :tick-line="false" :domain-line="false" /><VisAxis type="y" :tick-line="false" :domain-line="false" /></VisXYContainer></ChartContainer><template #fallback><p class="mt-5 text-sm text-muted-foreground">Grafik laporan per bulan.</p></template></ClientOnly><p class="mt-2 text-xs text-muted-foreground">Biru: WNA · Emas: WNI</p></div>
        <div class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"><h2 class="text-lg font-bold text-primary">Komposisi laporan</h2><ClientOnly><ChartContainer class="mt-4 flex min-h-56 items-center justify-center" :config="{ wna: { label: 'WNA', color: 'var(--chart-1)' }, wni: { label: 'WNI', color: 'var(--chart-3)' } }" :label="`Komposisi laporan: WNA ${proporsiWna} persen, WNI ${proporsiWni} persen`"><VisSingleContainer :height="200"><VisDonut :data="dataDonat" :value="ambilJumlahDonat" :color="ambilWarnaDonat" :central-label="`${proporsiWna + proporsiWni}%`" :arc-width="24" /></VisSingleContainer></ChartContainer><template #fallback><p class="text-sm text-muted-foreground">Grafik komposisi laporan.</p></template></ClientOnly><div class="mt-3 flex justify-between text-sm"><span>WNA {{ proporsiWna }}%</span><span>WNI {{ proporsiWni }}%</span></div></div>
        <div class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"><h2 class="text-lg font-bold text-primary">Kegiatan per jenis</h2><ul class="mt-5 grid gap-3"><li v-for="item in kegiatanPerJenis" :key="item.jenis" class="text-sm"><div class="mb-1 flex justify-between gap-2"><span>{{ item.jenis }}</span><span class="font-semibold">{{ item.jumlah }}</span></div><Progress :model-value="item.jumlah / nilaiMaksJenis * 100" /></li></ul><p v-if="!kegiatanPerJenis.length" class="mt-4 text-muted-foreground">Belum ada data kegiatan.</p></div>
        <div class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"><h2 class="text-lg font-bold text-primary">Desa non-DBI yang paling sering dilaporkan</h2><p class="mt-1 text-sm text-muted-foreground">Dapat diusulkan ke Kanwil sebagai Desa Binaan Imigrasi baru.</p><ol v-if="kandidatDbi.length" class="mt-4 list-inside list-decimal divide-y divide-border"><li v-for="item in kandidatDbi" :key="item.desa_id" class="py-2">{{ item.desa }}, {{ item.kecamatan }} <span class="text-muted-foreground">· {{ item.jumlah }} laporan</span></li></ol><p v-else class="mt-4 text-muted-foreground">Belum ada kandidat desa.</p></div>
      </section>
    </template>
  </div>
</template>
