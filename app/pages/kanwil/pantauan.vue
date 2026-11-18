<script setup lang="ts">
import { Building2, ChevronRight, CircleCheckBig, Info } from '@lucide/vue'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

definePageMeta({ layout: 'dashboard', title: 'Pantauan laporan' })
const route = useRoute()
const kantorDipilih = ref(typeof route.query.kantorId === 'string' ? route.query.kantorId : '')
const { data, pending, error, refresh } = await usePantauanKanwil(kantorDipilih)
const terlambat = (hari: number | null, batas: number | null) => Math.max(0, (hari ?? 0) - (batas ?? data.value?.batasHari ?? 0))
// Ringkasan jumlah per UPT untuk memudahkan teguran manual Kanwil.
const perUpt = computed(() => {
  const hitung = new Map<string, number>()
  for (const item of data.value.data) if (item.kantor) hitung.set(item.kantor, (hitung.get(item.kantor) ?? 0) + 1)
  return [...hitung.entries()].sort((a, b) => b[1] - a[1])
})
const bukaDetail = (id: string | null) => { if (id) void navigateTo(`/kanwil/laporan/${id}`) }
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Laporan terlambat">
      <template #deskripsi>Laporan berstatus Diterima yang belum ditanggapi lebih dari <strong class="font-semibold text-foreground">{{ data.batasHari }} hari kerja</strong> (tidak termasuk Sabtu, Minggu, dan hari libur).</template>
    </DashboardKepalaHalaman>

    <div v-if="!pending && !error && perUpt.length && !kantorDipilih" class="flex flex-wrap items-center gap-2 text-sm">
      <span class="text-muted-foreground">Per UPT:</span>
      <button v-for="[kantor, jumlah] in perUpt" :key="kantor" type="button" class="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium shadow-xs transition hover:border-destructive/40" @click="kantorDipilih = data.kantor.find(item => item.nama_singkat === kantor || item.nama === kantor)?.id ?? ''">
        {{ kantor }}<span class="rounded-full bg-destructive px-1.5 text-white tabular-nums">{{ jumlah }}</span>
      </button>
    </div>

    <DashboardBingkaiTabel>
      <template #toolbar>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="relative">
            <Building2 class="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label for="filter-upt" class="sr-only">Filter UPT</label>
            <NativeSelect id="filter-upt" v-model="kantorDipilih" class="h-9 w-56 bg-card pl-8"><NativeSelectOption value="">Semua UPT</NativeSelectOption><NativeSelectOption v-for="kantor in data.kantor" :key="kantor.id" :value="kantor.id">{{ kantor.nama_singkat }}</NativeSelectOption></NativeSelect>
          </div>
          <p class="flex items-center gap-1.5 text-sm text-muted-foreground"><Info class="size-4" aria-hidden="true" /><span><strong class="font-semibold text-destructive tabular-nums">{{ data.data.length }}</strong> laporan, paling lama di atas</span></p>
        </div>
      </template>
      <div v-if="pending" class="p-4"><DashboardStateMemuat :baris="6" /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Pantauan belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!data.data.length" class="p-4"><DashboardStateKosong judul="Tidak ada laporan yang terlambat ditanggapi." deskripsi="Semua laporan ditanggapi sesuai batas waktu." :ikon="CircleCheckBig" /></div>
      <Table v-else class="min-w-[1100px]">
        <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>UPT</TableHead><TableHead>Lokasi</TableHead><TableHead>Jenis</TableHead><TableHead>Masuk</TableHead><TableHead>Dibaca UPT</TableHead><TableHead class="text-right">Hari kerja berjalan</TableHead><TableHead>Keterlambatan</TableHead><TableHead class="w-10"><span class="sr-only">Buka</span></TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow v-for="(item, index) in data.data" :key="item.id ?? index" class="group cursor-pointer" @click="bukaDetail(item.id)">
            <TableCell><NuxtLink class="font-mono text-[0.8rem] font-semibold tracking-wide text-primary no-underline group-hover:underline" :to="`/kanwil/laporan/${item.id}`" @click.stop>{{ item.kode_pelacakan }}</NuxtLink></TableCell>
            <TableCell class="font-medium">{{ item.kantor }}</TableCell>
            <TableCell><p>{{ item.desa }}</p><p class="text-xs text-muted-foreground">Kec. {{ item.kecamatan }} · {{ item.kabupaten }}</p></TableCell>
            <TableCell><DashboardLencanaJenis :jenis="item.jenis_terlapor" /></TableCell>
            <TableCell class="text-muted-foreground"><DashboardWaktuRelatif v-if="item.masuk_pada" :waktu="item.masuk_pada" /><span v-else>—</span></TableCell>
            <TableCell><DashboardLencanaDibaca :dibaca-pada="item.dibaca_pada" /></TableCell>
            <TableCell class="text-right tabular-nums">{{ item.hari_kerja_berjalan ?? '—' }} <span class="text-xs text-muted-foreground">/ {{ item.batas_hari ?? data.batasHari }}</span></TableCell>
            <TableCell><DashboardLencanaBatas :sisa="-terlambat(item.hari_kerja_berjalan, item.batas_hari)" /></TableCell>
            <TableCell><ChevronRight class="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" /></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DashboardBingkaiTabel>
  </div>
</template>
