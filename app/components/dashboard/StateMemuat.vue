<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
import { TEKS_UMUM } from '~~/shared/config/teks'

withDefaults(defineProps<{ baris?: number; tinggi?: string }>(), { baris: 5, tinggi: 'h-11' })
</script>

<template>
  <div class="grid gap-2.5" role="status" aria-live="polite">
    <Skeleton v-for="n in baris" :key="n" class="w-full rounded-lg" :class="tinggi" />
    <span class="sr-only">{{ TEKS_UMUM.memuat }}</span>
  </div>
</template>
