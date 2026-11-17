<script setup lang="ts">
import type { Enums } from '~~/shared/types/database.types'
import { JENIS_TERLAPOR } from '~~/shared/config/teks'

const properti = defineProps<{ jenis: Enums<'jenis_terlapor'> | null | undefined }>()
const item = computed(() => JENIS_TERLAPOR.find(jenis => jenis.value === properti.jenis))
</script>

<template>
  <span v-if="item" class="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-semibold tracking-wide" :class="item.value === 'wna' ? 'border-primary/20 bg-primary/6 text-primary' : 'border-emas/40 bg-emas/12 text-emas-foreground'" :title="item.label">
    <span class="size-1.5 rounded-full" :class="item.value === 'wna' ? 'bg-chart-1' : 'bg-chart-3'" aria-hidden="true" />{{ item.singkat }}
  </span>
  <span v-else class="text-muted-foreground">—</span>
</template>
