<script setup lang="ts">
import { formatAngkaIndonesia } from '~~/shared/utils/angka'

// Daftar batang mendatar sederhana (mis. kegiatan per jenis). Semua butir tampil, termasuk yang 0.
const properti = defineProps<{ items: { label: string; nilai: number }[]; satuan?: string }>()
const maks = computed(() => Math.max(1, ...properti.items.map(item => item.nilai)))
</script>

<template>
  <ul class="grid gap-3.5">
    <li v-for="item in items" :key="item.label" class="grid gap-1.5">
      <div class="flex items-baseline justify-between gap-3 text-sm"><span class="min-w-0 truncate">{{ item.label }}</span><span class="shrink-0 font-semibold tabular-nums">{{ formatAngkaIndonesia(item.nilai) }}<span v-if="satuan" class="ml-1 text-xs font-normal text-muted-foreground">{{ satuan }}</span></span></div>
      <div class="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div class="h-full rounded-full bg-linear-to-r from-chart-2 to-chart-1 transition-[width] duration-500" :style="{ width: `${item.nilai / maks * 100}%` }" /></div>
    </li>
  </ul>
</template>
