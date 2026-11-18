<script setup lang="ts">
import { Music2 } from '@lucide/vue'

// Lucide tidak menyediakan ikon merek; Instagram digambar sederhana, TikTok memakai ikon not musik.
defineProps<{ nama: 'instagram' | 'tiktok' }>()
</script>

<template>
  <svg v-if="nama === 'instagram'" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
  <Music2 v-else class="size-5" aria-hidden="true" />
</template>
