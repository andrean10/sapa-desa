<script setup lang="ts">
import type { Component } from 'vue'
import { Inbox } from '@lucide/vue'

withDefaults(defineProps<{ judul: string; deskripsi?: string; ikon?: Component; ringkas?: boolean }>(), { deskripsi: undefined, ikon: () => Inbox })
</script>

<template>
  <div class="grid place-items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 text-center" :class="ringkas ? 'py-8' : 'py-12'">
    <span class="grid size-11 place-items-center rounded-xl bg-card text-muted-foreground shadow-xs ring-1 ring-border" aria-hidden="true"><component :is="ikon" class="size-5" /></span>
    <div class="max-w-md space-y-1">
      <p class="font-semibold text-foreground">{{ judul }}</p>
      <p v-if="deskripsi" class="text-sm text-muted-foreground">{{ deskripsi }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
