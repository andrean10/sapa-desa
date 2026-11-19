<script setup lang="ts">
import { TEKS_UMUM } from '~~/shared/config/teks'

defineProps<{ modeUji: boolean }>()
</script>

<template>
  <div v-if="modeUji" class="flex items-center gap-2 rounded-lg border border-emas/60 bg-emas/15 px-4 py-2.5 text-sm font-bold tracking-wide text-emas-teks" role="status">
    {{ TEKS_UMUM.modeUjiCoba }}
  </div>
</template>
