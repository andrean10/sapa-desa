<script setup lang="ts">
import { TEKS_UMUM } from '~~/shared/config/teks'

const pesan = useState<string | null>('notifikasi-global', () => null)
</script>

<template>
  <div v-if="pesan" class="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-4 rounded-lg border border-border bg-card p-4 text-foreground shadow-card" role="status" aria-live="polite">
    <p>{{ pesan }}</p>
    <button class="font-bold text-primary" type="button" :aria-label="TEKS_UMUM.tutup" @click="pesan = null">×</button>
  </div>
</template>
