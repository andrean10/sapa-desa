<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import type { ModePeriode } from '~~/shared/utils/waktu'
import { rentangPeriode, tanggalHariIniWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Dashboard UPT' })
const { profil } = useAuth()
const hariIni = tanggalHariIniWib()
const modePeriode = ref<ModePeriode>('bulan_ini')
const kustom = ref({ mulai: `${hariIni.slice(0, 7)}-01`, selesai: hariIni })
const periode = computed(() => rentangPeriode(modePeriode.value, kustom.value, hariIni))
const { data, pending, error, refresh } = await useDashboardUpt(periode)
</script>

<template>
  <div class="grid gap-6">
    <DashboardKepalaHalaman :judul="`Selamat bekerja, ${profil?.nama_tampil ?? 'UPT'}`" deskripsi="Apa yang perlu ditindak, apa yang hampir terlambat, dan desa mana yang belum dikunjungi.">
      <template #aksi>
        <Button variant="outline" as-child><NuxtLink to="/upt/laporan" class="no-underline">Laporan masyarakat</NuxtLink></Button>
        <Button as-child><NuxtLink to="/upt/kegiatan/baru" class="no-underline"><Plus class="size-4" />Laporan kegiatan</NuxtLink></Button>
      </template>
    </DashboardKepalaHalaman>
    <DashboardKontenDashboardUpt v-model:mode="modePeriode" v-model:kustom="kustom" :data="data" :pending="pending" :error="error" @coba="refresh()" />
  </div>
</template>
