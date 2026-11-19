<script setup lang="ts">
import { CircleCheckBig, ClipboardList, Hourglass, Inbox, MapPinned, Plus, TriangleAlert } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Skeleton } from '~/components/ui/skeleton'
import { AMBANG_DESA_LAMA_HARI } from '~~/shared/config/app'
import type { Database, Json } from '~~/shared/types/database.types'
import type { ModePeriode, RentangTanggal } from '~~/shared/utils/waktu'
import { formatTanggalWib } from '~~/shared/utils/waktu'

// Isi dashboard UPT (PRD 7.1). Dipakai oleh /upt (akun UPT) dan /kanwil/upt/[kantorId] (hanya baca, `kantorId` diisi).
type Fungsi = Database['public']['Functions']
export type DataDashboardUpt = {
  ringkasan: Fungsi['dashboard_upt_ringkasan']['Returns'][number] | null
  tindakan: Fungsi['dashboard_upt_perlu_tindakan']['Returns']
  desa: Fungsi['dashboard_upt_desa_binaan']['Returns']
  tren: Json
}
type TrenUpt = {
  laporan_per_bulan?: { bulan: string; total: number; wna: number; wni: number }[]
  proporsi?: { wna: number; wni: number }
  kegiatan_per_jenis?: { jenis: string; jumlah: number }[]
  kandidat_dbi?: { desa_id: string; desa: string; kecamatan: string; jumlah: number }[]
}

const properti = defineProps<{ data: DataDashboardUpt | null; pending: boolean; error: unknown; kantorId?: string }>()
defineEmits<{ coba: [] }>()
const modePeriode = defineModel<ModePeriode>('mode', { required: true })
const kustom = defineModel<RentangTanggal>('kustom', { required: true })

const hanyaBaca = computed(() => Boolean(properti.kantorId))
const memuatAwal = computed(() => properti.pending && !properti.data?.ringkasan)
const tren = computed(() => (properti.data?.tren ?? null) as TrenUpt | null)

// Tautan daftar laporan; tampilan Kanwil memakai filter status yang setara dengan kelompok di halaman UPT.
function tautanLaporan(jenis: 'perlu' | 'ditangani' | 'terlambat' | 'final' | 'semua') {
  if (!hanyaBaca.value) return { perlu: '/upt/laporan?status=diterima', ditangani: '/upt/laporan?kelompok=ditangani', terlambat: '/upt/laporan?terlambat=true', final: '/upt/laporan?kelompok=final', semua: '/upt/laporan' }[jenis]
  const dasar = `/kanwil/laporan?kantorId=${properti.kantorId}`
  return { perlu: `${dasar}&status=diterima`, ditangani: `${dasar}&status=diverifikasi&status=ditindaklanjuti`, terlambat: `${dasar}&terlambat=true`, final: `${dasar}&status=selesai&status=ditolak`, semua: dasar }[jenis]
}
const tautanDetail = (id: string) => hanyaBaca.value ? `/kanwil/laporan/${id}` : `/upt/laporan/${id}`
const tautanKegiatan = computed(() => hanyaBaca.value ? `/kanwil/kegiatan?kantorId=${properti.kantorId}` : '/upt/kegiatan')

const kartu = computed(() => {
  const r = properti.data?.ringkasan
  if (!r) return []
  return [
    { label: 'Perlu ditanggapi', nilai: r.perlu_ditanggapi, ikon: Inbox, nada: 'info' as const, ke: tautanLaporan('perlu'), keterangan: 'Status Diterima' },
    { label: 'Sedang ditangani', nilai: r.sedang_ditangani, ikon: Hourglass, nada: 'netral' as const, ke: tautanLaporan('ditangani'), keterangan: 'Diverifikasi & ditindaklanjuti' },
    { label: 'Terlambat', nilai: r.terlambat, ikon: TriangleAlert, nada: r.terlambat > 0 ? 'bahaya' as const : 'netral' as const, ke: tautanLaporan('terlambat'), keterangan: `Lebih dari ${r.batas_hari} hari kerja` },
    { label: 'Aduan selesai atau ditolak', nilai: r.selesai_ditolak_bulan_ini, ikon: CircleCheckBig, nada: 'sukses' as const, ke: tautanLaporan('final'), keterangan: 'Bulan ini' },
    { label: 'Kegiatan dilaporkan', nilai: r.kegiatan_bulan_ini, ikon: ClipboardList, nada: 'emas' as const, ke: tautanKegiatan.value, keterangan: 'Bulan ini' }
  ]
})

// Desa yang belum pernah dikunjungi paling atas, lalu yang paling lama tanpa kegiatan.
const desaUrut = computed(() => [...(properti.data?.desa ?? [])].sort((a, b) => {
  if (!a.kegiatan_terakhir !== !b.kegiatan_terakhir) return a.kegiatan_terakhir ? 1 : -1
  return (b.hari_sejak_kegiatan ?? 0) - (a.hari_sejak_kegiatan ?? 0)
}))
const desaLama = (item: { kegiatan_terakhir: string | null; hari_sejak_kegiatan: number | null }) => Boolean(item.kegiatan_terakhir) && (item.hari_sejak_kegiatan ?? 0) > AMBANG_DESA_LAMA_HARI
const jumlahDesaPerluDikunjungi = computed(() => desaUrut.value.filter(item => !item.kegiatan_terakhir || desaLama(item)).length)
</script>

<template>
  <div class="grid gap-6">
    <div v-if="memuatAwal" class="grid gap-6" role="status">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"><Skeleton v-for="n in 5" :key="n" class="h-34 rounded-xl" /></div>
      <Skeleton class="h-72 rounded-xl" />
      <span class="sr-only">Memuat dashboard…</span>
    </div>
    <DashboardStateGalat v-else-if="error && !data?.ringkasan" pesan="Ringkasan dashboard belum dapat dimuat." @coba="$emit('coba')" />
    <template v-else-if="data?.ringkasan">
      <DashboardKelompokDashboard judul="Kondisi saat ini" cakupan="Saat ini" nada="saatIni">
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
          <DashboardKartuAngka v-for="item in kartu.slice(0, 3)" :key="item.label" v-bind="item" />
        </div>
      </DashboardKelompokDashboard>

      <DashboardKelompokDashboard judul="Bulan ini" cakupan="Bulan berjalan" nada="periode">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <DashboardKartuAngka v-for="item in kartu.slice(3)" :key="item.label" v-bind="item" />
        </div>
      </DashboardKelompokDashboard>

      <DashboardKartuBagian judul="Perlu tindakan" deskripsi="Laporan berstatus Diterima, yang paling lama di atas." rapat>
        <template #aksi><Button variant="outline" size="sm" as-child><NuxtLink :to="tautanLaporan('semua')" class="no-underline">Lihat semua</NuxtLink></Button></template>
        <div v-if="!data.tindakan.length" class="border-t p-5"><DashboardStateKosong judul="Tidak ada laporan yang perlu ditanggapi." deskripsi="Semua laporan masuk sudah ditanggapi." :ikon="CircleCheckBig" ringkas /></div>
        <template v-else>
          <DashboardBingkaiTabel polos class="hidden md:block">
            <Table>
              <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Lokasi</TableHead><TableHead>Jenis</TableHead><TableHead>Masuk</TableHead><TableHead>Batas</TableHead><TableHead class="text-right"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow v-for="item in data.tindakan" :key="item.laporan_id" :class="item.sisa_hari_kerja < 0 ? 'bg-bahaya-muda/40 hover:bg-bahaya-muda/60' : ''">
                  <TableCell><NuxtLink :to="tautanDetail(item.laporan_id)" class="font-mono text-[0.8rem] font-semibold tracking-wide text-primary no-underline hover:underline">{{ item.kode_pelacakan }}</NuxtLink></TableCell>
                  <TableCell><p class="font-medium">{{ item.desa }}</p><p class="text-xs text-muted-foreground">Kec. {{ item.kecamatan }}</p></TableCell>
                  <TableCell><DashboardLencanaJenis :jenis="item.jenis_terlapor" /></TableCell>
                  <TableCell class="text-muted-foreground"><DashboardWaktuRelatif :waktu="item.masuk_pada" /></TableCell>
                  <TableCell><DashboardLencanaBatas :sisa="item.sisa_hari_kerja" /></TableCell>
                  <TableCell class="text-right"><Button size="sm" :variant="hanyaBaca ? 'outline' : 'default'" as-child><NuxtLink :to="tautanDetail(item.laporan_id)" class="no-underline">{{ hanyaBaca ? 'Lihat' : 'Tinjau' }}</NuxtLink></Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DashboardBingkaiTabel>
          <ul class="divide-y border-t md:hidden">
            <li v-for="item in data.tindakan" :key="item.laporan_id">
              <NuxtLink :to="tautanDetail(item.laporan_id)" class="grid gap-1.5 px-5 py-3.5 text-inherit no-underline active:bg-muted">
                <span class="flex items-center justify-between gap-3"><span class="font-mono text-sm font-semibold text-primary">{{ item.kode_pelacakan }}</span><DashboardLencanaJenis :jenis="item.jenis_terlapor" /></span>
                <span class="text-sm">{{ item.desa }}, {{ item.kecamatan }}</span>
                <span class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><DashboardWaktuRelatif :waktu="item.masuk_pada" /><DashboardLencanaBatas :sisa="item.sisa_hari_kerja" /></span>
              </NuxtLink>
            </li>
          </ul>
        </template>
      </DashboardKartuBagian>

      <DashboardKartuBagian judul="Desa binaan" rapat>
        <template #deskripsi>
          <span v-if="jumlahDesaPerluDikunjungi">{{ jumlahDesaPerluDikunjungi }} dari {{ desaUrut.length }} desa belum dikunjungi atau sudah lebih dari {{ AMBANG_DESA_LAMA_HARI }} hari tanpa kegiatan.</span>
          <span v-else>Semua desa binaan dikunjungi dalam {{ AMBANG_DESA_LAMA_HARI }} hari terakhir.</span>
        </template>
        <template #aksi><Button variant="outline" size="sm" as-child><NuxtLink :to="tautanKegiatan" class="no-underline">Laporan kegiatan</NuxtLink></Button></template>
        <div v-if="!desaUrut.length" class="border-t p-5"><DashboardStateKosong judul="Belum ada desa binaan di wilayah kantor." :ikon="MapPinned" ringkas /></div>
        <template v-else>
          <DashboardBingkaiTabel polos class="hidden md:block">
            <Table>
              <TableHeader><TableRow><TableHead>Desa</TableHead><TableHead>PIMPASA</TableHead><TableHead>Kegiatan terakhir</TableHead><TableHead class="text-right">Bulan ini</TableHead><TableHead v-if="!hanyaBaca" class="text-right"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow v-for="item in desaUrut" :key="item.desa_id" :class="!item.kegiatan_terakhir ? 'bg-peringatan-muda/70 hover:bg-peringatan-muda' : ''">
                  <TableCell><p class="font-medium">{{ item.desa }}</p><p class="text-xs text-muted-foreground">Kec. {{ item.kecamatan }} · {{ item.kabupaten }}</p></TableCell>
                  <TableCell><span v-if="item.petugas" class="inline-flex max-w-64 rounded-md bg-primary/6 px-2 py-0.5 text-xs font-medium text-primary">{{ item.petugas }}</span><span v-else class="text-xs text-muted-foreground italic">Belum ada petugas</span></TableCell>
                  <TableCell>
                    <span v-if="!item.kegiatan_terakhir" class="inline-flex rounded-full bg-peringatan px-2 py-0.5 text-xs font-semibold text-white">Belum pernah</span>
                    <div v-else class="flex flex-wrap items-center gap-2"><span>{{ formatTanggalWib(item.kegiatan_terakhir) }}</span><span class="text-xs" :class="desaLama(item) ? 'rounded-full bg-peringatan-muda px-2 py-0.5 font-semibold text-peringatan' : 'text-muted-foreground'">{{ item.hari_sejak_kegiatan === 0 ? 'hari ini' : `${item.hari_sejak_kegiatan} hari lalu` }}</span></div>
                  </TableCell>
                  <TableCell class="text-right font-semibold tabular-nums">{{ item.kegiatan_bulan_ini }}</TableCell>
                  <TableCell v-if="!hanyaBaca" class="text-right"><Button size="sm" variant="outline" as-child><NuxtLink :to="`/upt/kegiatan/baru?desa=${item.desa_id}`" class="no-underline"><Plus class="size-3.5" />Buat laporan</NuxtLink></Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DashboardBingkaiTabel>
          <ul class="divide-y border-t md:hidden">
            <li v-for="item in desaUrut" :key="item.desa_id" class="grid gap-2 px-5 py-3.5" :class="!item.kegiatan_terakhir ? 'bg-peringatan-muda/70' : ''">
              <div class="flex items-start justify-between gap-3"><div><p class="font-medium">{{ item.desa }}</p><p class="text-xs text-muted-foreground">Kec. {{ item.kecamatan }}</p></div><span class="text-xs text-muted-foreground">{{ item.kegiatan_bulan_ini }} kegiatan bulan ini</span></div>
              <p class="text-xs text-muted-foreground">PIMPASA: <span class="text-foreground">{{ item.petugas || 'Belum ada petugas' }}</span></p>
              <div class="flex items-center justify-between gap-2 text-xs"><span :class="!item.kegiatan_terakhir || desaLama(item) ? 'font-semibold text-peringatan' : 'text-muted-foreground'">{{ item.kegiatan_terakhir ? `Terakhir ${formatTanggalWib(item.kegiatan_terakhir)} (${item.hari_sejak_kegiatan} hari)` : 'Belum pernah dikunjungi' }}</span><Button v-if="!hanyaBaca" size="xs" variant="outline" as-child><NuxtLink :to="`/upt/kegiatan/baru?desa=${item.desa_id}`" class="no-underline">Buat laporan</NuxtLink></Button></div>
            </li>
          </ul>
        </template>
      </DashboardKartuBagian>

      <section class="grid gap-4" aria-labelledby="judul-tren-upt">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="judul-tren-upt" class="text-lg font-semibold text-foreground">Tren dan komposisi</h2><p class="text-sm text-muted-foreground">Periode memengaruhi komposisi, kegiatan per jenis, dan kandidat DBI.</p></div>
          <DashboardFilterPeriode v-model:mode="modePeriode" v-model:kustom="kustom" :opsi="['bulan_ini', 'enam_bulan', 'kustom']" />
        </div>
        <div class="grid gap-4 transition-opacity lg:grid-cols-3" :class="pending ? 'opacity-60' : ''" :aria-busy="pending">
          <DashboardKartuBagian class="lg:col-span-2" judul="Laporan masuk per bulan" deskripsi="Enam bulan hingga akhir periode, WNA dan WNI.">
            <DashboardGrafikBulanan :data="tren?.laporan_per_bulan ?? []" :seri="[{ key: 'wna', label: 'WNA', warna: 'var(--chart-1)' }, { key: 'wni', label: 'WNI', warna: 'var(--chart-3)' }]" label="Laporan per bulan" />
          </DashboardKartuBagian>
          <DashboardKartuBagian judul="Komposisi laporan" deskripsi="Proporsi WNA dan WNI dalam periode.">
            <DashboardGrafikKomposisi :wna="tren?.proporsi?.wna ?? 0" :wni="tren?.proporsi?.wni ?? 0" />
          </DashboardKartuBagian>
          <DashboardKartuBagian judul="Kegiatan per jenis" deskripsi="Semua jenis kegiatan aktif dalam periode.">
            <DashboardBatangMendatar v-if="tren?.kegiatan_per_jenis?.length" :items="tren.kegiatan_per_jenis.map(item => ({ label: item.jenis, nilai: item.jumlah }))" />
            <DashboardStateKosong v-else judul="Belum ada data kegiatan." ringkas />
          </DashboardKartuBagian>
          <DashboardKartuBagian class="lg:col-span-2" judul="Desa non-DBI yang paling sering dilaporkan" deskripsi="Dapat diusulkan ke Kanwil sebagai Desa Binaan Imigrasi baru." rapat>
            <div v-if="!tren?.kandidat_dbi?.length" class="border-t p-5"><DashboardStateKosong judul="Belum ada kandidat desa." ringkas /></div>
            <DashboardBingkaiTabel v-else polos>
              <Table>
                <TableHeader><TableRow><TableHead class="w-12">#</TableHead><TableHead>Desa</TableHead><TableHead>Kecamatan</TableHead><TableHead class="text-right">Laporan</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow v-for="(item, index) in tren.kandidat_dbi" :key="item.desa_id"><TableCell class="text-muted-foreground tabular-nums">{{ index + 1 }}</TableCell><TableCell class="font-medium">{{ item.desa }}</TableCell><TableCell class="text-muted-foreground">{{ item.kecamatan }}</TableCell><TableCell class="text-right font-semibold tabular-nums">{{ item.jumlah }}</TableCell></TableRow>
                </TableBody>
              </Table>
            </DashboardBingkaiTabel>
          </DashboardKartuBagian>
        </div>
      </section>
    </template>
  </div>
</template>
