<script setup lang="ts">
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', title: 'Pantauan laporan' })
const route = useRoute()
const kantorDipilih = ref(typeof route.query.kantorId === 'string' ? route.query.kantorId : '')
const { data, pending, error, refresh } = await usePantauanKanwil(kantorDipilih)
const terlambat = (hari: number | null, batas: number | null) => Math.max(0, (hari ?? 0) - (batas ?? data.value.batasHari))
</script>

<template>
  <div class="grid gap-5">
    <header class="flex flex-wrap items-end justify-between gap-4"><div><h2 class="text-2xl font-semibold tracking-tight">Pantauan laporan terlambat</h2><p class="mt-1 max-w-3xl text-sm text-muted-foreground">Laporan berstatus Diterima yang belum ditanggapi lebih dari {{ data.batasHari }} hari kerja, tidak termasuk Sabtu, Minggu, dan hari libur.</p></div><label class="grid gap-1.5 text-sm font-medium">Filter UPT<NativeSelect v-model="kantorDipilih" class="min-w-56"><NativeSelectOption value="">Semua UPT</NativeSelectOption><NativeSelectOption v-for="kantor in data.kantor" :key="kantor.id" :value="kantor.id">{{ kantor.nama_singkat }}</NativeSelectOption></NativeSelect></label></header>
    <Card><CardHeader><CardTitle>Kasus yang perlu perhatian</CardTitle><CardDescription>{{ data.data.length }} laporan melewati batas waktu tanggapan.</CardDescription></CardHeader><CardContent><div v-if="pending" class="grid gap-3"><Skeleton v-for="i in 5" :key="i" class="h-12 w-full" /></div><div v-else-if="error" class="grid gap-3 text-sm text-destructive" role="alert">Pantauan belum dapat dimuat.<Button class="w-fit" variant="outline" @click="refresh()">Coba lagi</Button></div><Table v-else><TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>UPT</TableHead><TableHead>Kabupaten/Kota</TableHead><TableHead>Kecamatan</TableHead><TableHead>Desa/Kelurahan</TableHead><TableHead>Jenis</TableHead><TableHead>Masuk</TableHead><TableHead>Hari kerja</TableHead><TableHead>Batas</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="(item, index) in data.data" :key="item.id ?? index" class="hover:bg-muted/50"><TableCell><NuxtLink class="font-mono font-semibold text-foreground underline-offset-4 hover:underline" :to="`/kanwil/laporan/${item.id}`">{{ item.kode_pelacakan }}</NuxtLink></TableCell><TableCell>{{ item.kantor }}</TableCell><TableCell>{{ item.kabupaten }}</TableCell><TableCell>{{ item.kecamatan }}</TableCell><TableCell>{{ item.desa }}</TableCell><TableCell>{{ item.jenis_terlapor?.toUpperCase() }}</TableCell><TableCell>{{ item.masuk_pada ? formatTanggalWaktuWib(item.masuk_pada) : '—' }}</TableCell><TableCell><Badge variant="destructive">Terlambat {{ terlambat(item.hari_kerja_berjalan, item.batas_hari) }} hari</Badge></TableCell><TableCell>{{ item.batas_hari ?? data.batasHari }} hari</TableCell><TableCell>Diterima</TableCell></TableRow><TableEmpty v-if="!data.data.length" :colspan="10">Tidak ada laporan yang terlambat ditanggapi.</TableEmpty></TableBody></Table></CardContent></Card>
  </div>
</template>
