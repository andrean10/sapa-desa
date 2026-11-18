<script setup lang="ts">
import { LOGO_INSTANSI, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'

withDefaults(defineProps<{ tinggi?: string; tanpaTeks?: boolean }>(), { tinggi: 'h-12', tanpaTeks: false })
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-5 sm:flex-row">
    <p v-if="!tanpaTeks" class="text-center text-sm font-semibold text-muted-foreground sm:text-left">{{ REGIONAL_OFFICE_NAME }}</p>
    <ul class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      <li v-for="logo in LOGO_INSTANSI" :key="logo.src"><img :src="logo.src" :alt="logo.alt" :width="logo.lebar" :height="logo.tinggi" loading="lazy" class="w-auto object-contain" :class="tinggi"></li>
    </ul>
  </div>
</template>
