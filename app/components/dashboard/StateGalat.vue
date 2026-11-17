<script setup lang="ts">
import { CircleAlert, RotateCw } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { TEKS_UMUM } from '~~/shared/config/teks'

withDefaults(defineProps<{ pesan: string; deskripsi?: string }>(), { deskripsi: 'Periksa koneksi Anda, lalu coba lagi.' })
defineEmits<{ coba: [] }>()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl border border-destructive/25 bg-bahaya-muda/60 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
    <div class="flex items-start gap-3">
      <CircleAlert class="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
      <div><p class="font-semibold text-destructive">{{ pesan }}</p><p class="mt-0.5 text-sm text-muted-foreground">{{ deskripsi }}</p></div>
    </div>
    <Button variant="outline" class="w-fit bg-card" @click="$emit('coba')"><RotateCw class="size-4" />{{ TEKS_UMUM.cobaLagi }}</Button>
  </div>
</template>
