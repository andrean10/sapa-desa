<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

defineProps<{ judul: string; deskripsi?: string; label?: string; kembali?: { to: string; label: string } }>()
</script>

<template>
  <header class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0 space-y-1">
      <NuxtLink v-if="kembali" :to="kembali.to" class="mb-2 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground no-underline transition hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"><ArrowLeft class="size-4" aria-hidden="true" />{{ kembali.label }}</NuxtLink>
      <p v-if="label" class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{{ label }}</p>
      <h1 class="text-2xl font-semibold tracking-tight text-primary sm:text-[1.75rem]"><slot name="judul">{{ judul }}</slot></h1>
      <p v-if="deskripsi || $slots.deskripsi" class="max-w-3xl text-sm leading-6 text-muted-foreground"><slot name="deskripsi">{{ deskripsi }}</slot></p>
    </div>
    <div v-if="$slots.aksi" class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"><slot name="aksi" /></div>
  </header>
</template>
