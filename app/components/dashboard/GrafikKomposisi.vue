<script setup lang="ts">
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import { ChartContainer } from '~/components/ui/chart'
import { Skeleton } from '~/components/ui/skeleton'

// Donat proporsi WNA/WNI (nilai dalam persen dari fungsi database).
const properti = defineProps<{ wna: number; wni: number }>()
const data = computed(() => [{ jenis: 'WNA', nilai: properti.wna, warna: 'var(--chart-1)' }, { jenis: 'WNI', nilai: properti.wni, warna: 'var(--chart-3)' }])
const kosong = computed(() => properti.wna + properti.wni === 0)
const ambilNilai = (item: { nilai: number }) => item.nilai
const ambilWarna = (item: { warna: string }) => item.warna
</script>

<template>
  <div class="grid gap-4">
    <div class="relative mx-auto aspect-square w-full max-w-[200px]">
      <ClientOnly>
        <ChartContainer v-if="!kosong" :config="{ wna: { label: 'WNA', color: 'var(--chart-1)' }, wni: { label: 'WNI', color: 'var(--chart-3)' } }" class="aspect-square">
          <VisSingleContainer :data="data" :height="200" :aria-label="`Komposisi laporan: WNA ${wna} persen, WNI ${wni} persen`">
            <VisDonut :value="ambilNilai" :color="ambilWarna" :arc-width="26" :pad-angle="0.02" :corner-radius="4" />
          </VisSingleContainer>
        </ChartContainer>
        <div v-else class="grid size-full place-items-center rounded-full border-[26px] border-muted" />
        <template #fallback><Skeleton class="size-full rounded-full" /></template>
      </ClientOnly>
      <div class="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div><p class="text-2xl font-semibold tabular-nums text-foreground">{{ kosong ? '—' : `${wna}%` }}</p><p class="text-xs text-muted-foreground">laporan WNA</p></div>
      </div>
    </div>
    <dl class="grid grid-cols-2 gap-3 text-sm">
      <div class="rounded-lg border bg-muted/30 px-3 py-2"><dt class="flex items-center gap-1.5 text-muted-foreground"><span class="size-2.5 rounded-sm bg-chart-1" aria-hidden="true" />WNA</dt><dd class="mt-0.5 text-lg font-semibold tabular-nums">{{ wna }}%</dd></div>
      <div class="rounded-lg border bg-muted/30 px-3 py-2"><dt class="flex items-center gap-1.5 text-muted-foreground"><span class="size-2.5 rounded-sm bg-chart-3" aria-hidden="true" />WNI</dt><dd class="mt-0.5 text-lg font-semibold tabular-nums">{{ wni }}%</dd></div>
    </dl>
  </div>
</template>
