<script setup lang="ts">
import { Eye } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import type { DataDashboardUpt } from '~/components/dashboard/KontenDashboardUpt.vue'
import type { ModePeriode } from '~~/shared/utils/waktu'
import { rentangPeriode, tanggalHariIniWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Ringkasan UPT' })
const route = useRoute()
const kantorId = computed(() => String(route.params.kantorId))
const hariIni = tanggalHariIniWib()
const modePeriode = ref<ModePeriode>('bulan_ini')
const kustom = ref({ mulai: `${hariIni.slice(0, 7)}-01`, selesai: hariIni })
const periode = computed(() => rentangPeriode(modePeriode.value, kustom.value, hariIni))
const api = useApi()
type DataUpt = DataDashboardUpt & { kantor: { nama: string; nama_singkat: string } }
const { data, pending, error, refresh } = await useAsyncData<DataUpt>(() => `kanwil-lihat-upt-${kantorId.value}`, () => api<DataUpt>(`/api/kanwil/upt/${kantorId.value}`, { query: periode.value }), { lazy: true, watch: [periode] })
</script>

<template>
  <div class="grid gap-6">
    <DashboardKepalaHalaman :judul="data?.kantor.nama ?? 'Dashboard UPT'" :kembali="{ to: '/kanwil', label: 'Dashboard Kanwil' }">
      <template #deskripsi><span class="inline-flex items-center gap-1.5"><Eye class="size-4" aria-hidden="true" />Tampilan dashboard {{ data?.kantor.nama_singkat ?? 'UPT' }} · hanya baca</span></template>
      <template #aksi>
        <Button variant="outline" as-child><NuxtLink :to="`/kanwil/pantauan?kantorId=${kantorId}`" class="no-underline">Pantauan terlambat</NuxtLink></Button>
        <Button variant="outline" as-child><NuxtLink :to="`/kanwil/kegiatan?kantorId=${kantorId}`" class="no-underline">Kegiatan</NuxtLink></Button>
        <Button as-child><NuxtLink :to="`/kanwil/laporan?kantorId=${kantorId}`" class="no-underline">Laporan</NuxtLink></Button>
      </template>
    </DashboardKepalaHalaman>
    <DashboardKontenDashboardUpt v-model:mode="modePeriode" v-model:kustom="kustom" :data="data ?? null" :pending="pending" :error="error" :kantor-id="kantorId" @coba="refresh()" />
  </div>
</template>
