<script setup lang="ts">
// Kartu bagian standar: judul + deskripsi + aksi kanan, isi di bawah. `rapat` menghapus padding isi (untuk tabel).
withDefaults(defineProps<{ judul: string; deskripsi?: string; rapat?: boolean }>(), { deskripsi: undefined })
</script>

<template>
  <section class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs">
    <header class="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between" :class="rapat ? 'pb-4' : ''">
      <div class="min-w-0 space-y-1">
        <h2 class="font-semibold leading-tight text-foreground">{{ judul }}</h2>
        <p v-if="deskripsi || $slots.deskripsi" class="text-sm text-muted-foreground"><slot name="deskripsi">{{ deskripsi }}</slot></p>
      </div>
      <div v-if="$slots.aksi" class="flex shrink-0 flex-wrap items-center gap-2"><slot name="aksi" /></div>
    </header>
    <div class="min-w-0 flex-1" :class="rapat ? '' : 'p-5'"><slot /></div>
  </section>
</template>
