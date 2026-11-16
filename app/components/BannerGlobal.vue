<script setup lang="ts">
import { TEKS_UMUM } from '~~/shared/config/teks'

defineProps<{ modeUji: boolean }>()
</script>

<template>
  <div v-if="modeUji" class="rounded-lg border border-accent bg-accent/20 px-4 py-3 font-bold text-accent-foreground" role="status">
    {{ TEKS_UMUM.modeUjiCoba }}
  </div>
</template>
