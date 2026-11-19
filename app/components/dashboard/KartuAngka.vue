<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowUpRight } from '@lucide/vue'
import { formatAngkaIndonesia } from '~~/shared/utils/angka'

export type NadaKartu = 'netral' | 'info' | 'sukses' | 'peringatan' | 'bahaya' | 'emas'

const properti = withDefaults(defineProps<{
  label: string
  nilai: number | string
  keterangan?: string
  ikon?: Component
  nada?: NadaKartu
  ke?: string
  ringkas?: boolean
}>(), { nada: 'netral', keterangan: undefined, ikon: undefined, ke: undefined })

const NuxtLink = resolveComponent('NuxtLink')
const nilaiTampil = computed(() => typeof properti.nilai === 'number' ? formatAngkaIndonesia(properti.nilai) : properti.nilai)
const kelasIkon: Record<NadaKartu, string> = {
  netral: 'bg-primary/8 text-primary',
  info: 'bg-info-muda text-info',
  sukses: 'bg-sukses-muda text-sukses',
  peringatan: 'bg-peringatan-muda text-peringatan',
  bahaya: 'bg-bahaya-muda text-destructive',
  emas: 'bg-emas/15 text-emas-teks'
}
</script>

<template>
  <component
    :is="ke ? NuxtLink : 'div'"
    :to="ke"
    class="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-linear-to-t from-primary/[0.035] to-card text-card-foreground no-underline shadow-xs transition"
    :class="[
      ringkas ? 'gap-1 p-4' : 'gap-2 p-4 sm:p-5',
      nada === 'bahaya' ? 'border-destructive/35 from-destructive/[0.06]' : 'border-border/80',
      ke ? 'hover:-translate-y-px hover:border-primary/35 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none' : ''
    ]"
  >
    <span v-if="nada === 'bahaya'" class="absolute inset-x-0 top-0 h-0.5 bg-destructive" aria-hidden="true" />
    <div class="flex items-start justify-between gap-3">
      <p class="min-w-0 text-sm font-medium text-muted-foreground">{{ label }}</p>
      <span v-if="ikon" class="grid shrink-0 place-items-center rounded-lg" :class="[kelasIkon[nada], ringkas ? 'size-8' : 'size-8 sm:size-9']" aria-hidden="true"><component :is="ikon" :class="ringkas ? 'size-4' : 'size-[1.125rem]'" /></span>
    </div>
    <p class="font-semibold tabular-nums tracking-tight" :class="[ringkas ? 'text-2xl' : 'text-2xl sm:text-3xl', nada === 'bahaya' ? 'text-destructive' : 'text-foreground']">{{ nilaiTampil }}</p>
    <slot />
    <p v-if="keterangan || ke" class="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
      <span :class="nada === 'bahaya' ? 'font-medium text-destructive' : ''">{{ keterangan }}</span>
      <ArrowUpRight v-if="ke" class="size-4 shrink-0 text-primary opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
    </p>
  </component>
</template>
