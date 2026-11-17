<script setup lang="ts">
import { Clock, TriangleAlert } from '@lucide/vue'

// sisa >= 0: sisa hari kerja; sisa < 0: terlambat sebanyak |sisa| hari kerja.
defineProps<{ sisa: number }>()
</script>

<template>
  <span v-if="sisa < 0" class="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-bahaya-muda px-2 py-0.5 text-xs font-semibold text-destructive"><TriangleAlert class="size-3.5" aria-hidden="true" />Terlambat {{ Math.abs(sisa) }} hari kerja</span>
  <span v-else class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium" :class="sisa <= 1 ? 'bg-peringatan-muda text-peringatan' : 'bg-muted text-muted-foreground'"><Clock class="size-3.5" aria-hidden="true" />Sisa {{ sisa }} hari kerja</span>
</template>
