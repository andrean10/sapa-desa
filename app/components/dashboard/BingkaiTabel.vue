<!-- Bingkai tabel standar dashboard: kepala tabel redam, jarak sel konsisten, gulir horizontal.
     `polos` dipakai saat tabel berada di dalam KartuBagian (tanpa bingkai ganda). -->
<script setup lang="ts">
defineProps<{ polos?: boolean }>()
</script>

<template>
  <div class="min-w-0 overflow-hidden bg-card" :class="polos ? 'border-t' : 'rounded-xl border shadow-xs'">
    <div v-if="$slots.toolbar" class="flex flex-col gap-3 border-b p-3 sm:p-4"><slot name="toolbar" /></div>
    <div class="tabel-dashboard min-w-0 overflow-x-auto"><slot /></div>
    <slot name="footer" />
  </div>
</template>

<style scoped>
.tabel-dashboard :deep(thead) { background: color-mix(in srgb, var(--muted) 70%, transparent); }
.tabel-dashboard :deep(th) { height: 2.5rem; font-size: 0.8rem; font-weight: 600; color: var(--muted-foreground); }
.tabel-dashboard :deep(td) { padding-block: 0.75rem; }
.tabel-dashboard :deep(th:first-child), .tabel-dashboard :deep(td:first-child) { padding-left: 1rem; }
.tabel-dashboard :deep(th:last-child), .tabel-dashboard :deep(td:last-child) { padding-right: 1rem; }
.tabel-dashboard :deep(tbody tr:last-child) { border-bottom: 0; }
</style>
