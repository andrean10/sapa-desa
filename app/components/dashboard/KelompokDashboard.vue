<script setup lang="ts">
// Pembungkus satu kelompok angka dashboard dengan judul dan penanda cakupan waktunya
// ("Saat ini" tidak ikut filter periode, atau rentang periode yang dipilih), supaya angka dari dua jenis tidak tercampur.
defineProps<{ judul: string; cakupan: string; nada?: 'saatIni' | 'periode' }>()
</script>

<template>
  <section class="grid gap-3" :aria-label="judul">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <h2 class="text-sm font-semibold text-foreground">{{ judul }}</h2>
      <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="nada === 'saatIni' ? 'bg-primary/8 text-primary' : 'bg-emas/15 text-emas-teks'">{{ cakupan }}</span>
    </div>
    <slot />
  </section>
</template>
