<script setup lang="ts">
import { Info, Medal } from '@lucide/vue'
import { Switch } from '~/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { formatAngkaIndonesia } from '~~/shared/utils/angka'
import type { ModePeriode } from '~~/shared/utils/waktu'
import { rentangPeriode, tanggalHariIniWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Peringkat' })
const tab = ref<'upt' | 'kecamatan' | 'desa'>('upt')
const hariIni = tanggalHariIniWib()
const modePeriode = ref<ModePeriode>('bulan_ini')
const kustom = ref({ mulai: `${hariIni.slice(0, 7)}-01`, selesai: hariIni })
const hanyaNonDbi = ref(false)
const periode = computed(() => rentangPeriode(modePeriode.value, kustom.value, hariIni))
const { data, pending, error, refresh } = await usePeringkatKanwil(computed(() => ({ ...periode.value, hanyaNonDbi: tab.value === 'desa' && hanyaNonDbi.value })))
const TAB = [{ value: 'upt', label: 'UPT' }, { value: 'kecamatan', label: 'Kecamatan' }, { value: 'desa', label: 'Desa' }]
const uptKegiatan = computed(() => [...data.value.upt].sort((a, b) => a.peringkat_kegiatan - b.peringkat_kegiatan))
const uptRespons = computed(() => [...data.value.upt].sort((a, b) => a.peringkat_respons - b.peringkat_respons))
const maksKegiatan = computed(() => Math.max(1, ...data.value.upt.map(item => item.laporan_kegiatan)))
const maksRespons = computed(() => Math.max(1, ...data.value.upt.map(item => item.laporan_direspon)))
const maksKecamatan = computed(() => Math.max(1, ...data.value.kecamatan.map(item => item.jumlah_laporan)))
const maksDesa = computed(() => Math.max(1, ...data.value.desa.map(item => item.jumlah_laporan)))
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Peringkat" deskripsi="UPT paling aktif, serta kecamatan dan desa yang paling sering dilaporkan masyarakat.">
      <template #aksi><DashboardFilterPeriode v-model:mode="modePeriode" v-model:kustom="kustom" :opsi="['bulan_ini', 'bulan_lalu', 'tahun_ini', 'kustom']" /></template>
    </DashboardKepalaHalaman>
    <DashboardSegmenTab :items="TAB" :aktif="tab" label="Jenis peringkat" @pilih="value => tab = value as typeof tab" />

    <div v-if="pending" class="grid gap-4 lg:grid-cols-2"><DashboardStateMemuat :baris="7" /><DashboardStateMemuat :baris="7" /></div>
    <DashboardStateGalat v-else-if="error" pesan="Peringkat belum dapat dimuat." @coba="refresh()" />

    <div v-else-if="tab === 'upt'" class="grid gap-4 lg:grid-cols-2">
      <DashboardKartuBagian v-for="kolom in [{ judul: 'Laporan kegiatan PIMPASA', satuan: 'kegiatan', baris: uptKegiatan.map(item => ({ id: item.kantor_id, nama: item.kantor, peringkat: item.peringkat_kegiatan, nilai: item.laporan_kegiatan, maks: maksKegiatan })) }, { judul: 'Respons laporan masyarakat', satuan: 'direspon', baris: uptRespons.map(item => ({ id: item.kantor_id, nama: item.kantor, peringkat: item.peringkat_respons, nilai: item.laporan_direspon, maks: maksRespons })) }]" :key="kolom.judul" :judul="kolom.judul" rapat>
        <template v-if="kolom.satuan === 'direspon'" #aksi>
          <Tooltip><TooltipTrigger as-child><button type="button" class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Info class="size-3.5" />Cara menghitung</button></TooltipTrigger><TooltipContent class="max-w-64">Direspon = laporan yang pertama kali keluar dari status Diterima pada periode ini, termasuk yang ditolak.</TooltipContent></Tooltip>
        </template>
        <div v-if="!kolom.baris.length" class="border-t p-5"><DashboardStateKosong judul="Belum ada data UPT." ringkas /></div>
        <ol v-else class="divide-y border-t">
          <li v-for="item in kolom.baris" :key="item.id" class="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-5 py-3" :class="item.peringkat <= 3 && item.nilai > 0 ? 'bg-emas/[0.06]' : ''">
            <span class="grid size-8 place-items-center rounded-full text-sm font-semibold tabular-nums" :class="item.peringkat <= 3 && item.nilai > 0 ? 'bg-emas text-emas-foreground shadow-sm' : 'bg-muted text-muted-foreground'"><Medal v-if="item.peringkat === 1 && item.nilai > 0" class="size-4" aria-label="Peringkat 1" /><template v-else>{{ item.peringkat }}</template></span>
            <div class="min-w-0"><p class="truncate font-medium">{{ item.nama }}</p><div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div class="h-full rounded-full bg-linear-to-r from-chart-2 to-chart-1" :style="{ width: `${item.nilai / item.maks * 100}%` }" /></div></div>
            <p class="text-right"><span class="text-lg font-semibold tabular-nums">{{ formatAngkaIndonesia(item.nilai) }}</span><span class="block text-xs text-muted-foreground">{{ kolom.satuan }}</span></p>
          </li>
        </ol>
      </DashboardKartuBagian>
    </div>

    <DashboardKartuBagian v-else-if="tab === 'kecamatan'" judul="Kecamatan dengan laporan terbanyak" deskripsi="Hanya kecamatan yang memiliki laporan dalam periode." rapat>
      <div v-if="!data.kecamatan.length" class="border-t p-5"><DashboardStateKosong judul="Belum ada laporan di periode ini." ringkas /></div>
      <DashboardBingkaiTabel v-else polos>
        <Table>
          <TableHeader><TableRow><TableHead class="w-16">#</TableHead><TableHead>Kecamatan</TableHead><TableHead>Kabupaten/Kota</TableHead><TableHead class="w-1/3">Laporan</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="item in data.kecamatan" :key="item.kecamatan_id">
              <TableCell><span class="grid size-7 place-items-center rounded-full text-xs font-semibold tabular-nums" :class="item.peringkat <= 3 ? 'bg-emas text-emas-foreground' : 'bg-muted text-muted-foreground'">{{ item.peringkat }}</span></TableCell>
              <TableCell class="font-medium">{{ item.kecamatan }}</TableCell>
              <TableCell class="text-muted-foreground">{{ item.kabupaten }}</TableCell>
              <TableCell><div class="flex items-center gap-3"><div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div class="h-full rounded-full bg-chart-2" :style="{ width: `${item.jumlah_laporan / maksKecamatan * 100}%` }" /></div><span class="w-8 text-right font-semibold tabular-nums">{{ item.jumlah_laporan }}</span></div></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DashboardBingkaiTabel>
    </DashboardKartuBagian>

    <DashboardKartuBagian v-else :judul="hanyaNonDbi ? 'Kandidat Desa Binaan Imigrasi' : 'Desa dengan laporan terbanyak'" :deskripsi="hanyaNonDbi ? 'Desa yang belum menjadi DBI, diurutkan berdasarkan jumlah laporan.' : 'Hanya desa yang memiliki laporan dalam periode.'" rapat>
      <template #aksi><label class="flex items-center gap-2 text-sm font-medium"><Switch v-model="hanyaNonDbi" />Hanya non-DBI (kandidat DBI)</label></template>
      <div v-if="!data.desa.length" class="border-t p-5"><DashboardStateKosong judul="Belum ada laporan di periode ini." ringkas /></div>
      <DashboardBingkaiTabel v-else polos>
        <Table>
          <TableHeader><TableRow><TableHead class="w-16">#</TableHead><TableHead>Desa/Kelurahan</TableHead><TableHead>Kecamatan</TableHead><TableHead>Kabupaten/Kota</TableHead><TableHead>Status</TableHead><TableHead class="w-1/4">Laporan</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="item in data.desa" :key="item.desa_id">
              <TableCell><span class="grid size-7 place-items-center rounded-full text-xs font-semibold tabular-nums" :class="item.peringkat <= 3 ? 'bg-emas text-emas-foreground' : 'bg-muted text-muted-foreground'">{{ item.peringkat }}</span></TableCell>
              <TableCell class="font-medium">{{ item.desa }}</TableCell>
              <TableCell class="text-muted-foreground">{{ item.kecamatan }}</TableCell>
              <TableCell class="text-muted-foreground">{{ item.kabupaten }}</TableCell>
              <TableCell><span v-if="item.dbi" class="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">DBI</span><span v-else class="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">Non-DBI</span></TableCell>
              <TableCell><div class="flex items-center gap-3"><div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div class="h-full rounded-full bg-chart-2" :style="{ width: `${item.jumlah_laporan / maksDesa * 100}%` }" /></div><span class="w-8 text-right font-semibold tabular-nums">{{ item.jumlah_laporan }}</span></div></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DashboardBingkaiTabel>
    </DashboardKartuBagian>
  </div>
</template>
