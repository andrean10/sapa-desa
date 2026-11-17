<script setup lang="ts">
import { VisAxis, VisStackedBar, VisXYContainer } from '@unovis/vue'
import type { ChartConfig } from '~/components/ui/chart'
import { ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent, componentToString } from '~/components/ui/chart'
import { Skeleton } from '~/components/ui/skeleton'
import { TIMEZONE } from '~~/shared/config/app'
import { formatBulanSingkatWib } from '~~/shared/utils/waktu'

// Grafik batang (bertumpuk) per bulan dengan tooltip dan legenda. `data` berisi kolom `bulan` (YYYY-MM-DD) + kolom angka per seri.
export type SeriGrafik = { key: string; label: string; warna: string }
const properti = withDefaults(defineProps<{ data: Record<string, unknown>[]; seri: SeriGrafik[]; label: string; tinggi?: number }>(), { tinggi: 240 })

type Titik = Record<string, number>
const titik = computed<Titik[]>(() => properti.data.map((item, urutan) => {
  const hasil: Titik = { urutan, tanggal: new Date(`${String(item.bulan).slice(0, 7)}-01T00:00:00+07:00`).getTime() }
  for (const seri of properti.seri) hasil[seri.key] = Number(item[seri.key] ?? 0)
  return hasil
}))
const config = computed<ChartConfig>(() => Object.fromEntries(properti.seri.map(seri => [seri.key, { label: seri.label, color: seri.warna }])))
// Sumbu X memakai urutan (bukan epoch) agar setiap bulan tepat satu label.
const ambilX = (item: Titik) => item.urutan ?? 0
const ambilY = computed(() => properti.seri.map(seri => (item: Titik) => item[seri.key] ?? 0))
const warna = computed(() => properti.seri.map(seri => seri.warna))
const tanggalKe = (urutan: number | Date) => titik.value[Math.round(Number(urutan))]?.tanggal ?? 0
const formatBulan = (urutan: number | Date) => formatBulanSingkatWib(tanggalKe(urutan))
const formatBulanPanjang = (urutan: number | Date) => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: TIMEZONE }).format(new Date(tanggalKe(urutan)))
const ringkasanAria = computed(() => `${properti.label}: ${titik.value.map(item => `${formatBulan(item.urutan!)} ${properti.seri.map(seri => `${seri.label} ${item[seri.key]}`).join(', ')}`).join('; ')}`)
</script>

<template>
  <div class="grid gap-3">
    <ClientOnly>
      <ChartContainer :config="config" class="aspect-auto w-full" :style="{ height: `${tinggi}px` }" cursor>
        <VisXYContainer :data="titik" :height="tinggi" :margin="{ left: 4, right: 4 }" :aria-label="ringkasanAria">
          <VisStackedBar :x="ambilX" :y="ambilY" :color="warna" :rounded-corners="4" :bar-padding="0.28" />
          <VisAxis type="x" :x="ambilX" :tick-format="formatBulan" :tick-values="titik.map(item => item.urutan!)" :tick-line="false" :domain-line="false" :grid-line="false" />
          <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false" />
          <ChartTooltip />
          <ChartCrosshair :template="componentToString(config, ChartTooltipContent, { labelFormatter: formatBulanPanjang })" color="transparent" />
        </VisXYContainer>
      </ChartContainer>
      <template #fallback><Skeleton class="w-full" :style="{ height: `${tinggi}px` }" /></template>
    </ClientOnly>
    <ul class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li v-for="item in seri" :key="item.key" class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-sm" :style="{ backgroundColor: item.warna }" aria-hidden="true" />{{ item.label }}</li>
    </ul>
  </div>
</template>
