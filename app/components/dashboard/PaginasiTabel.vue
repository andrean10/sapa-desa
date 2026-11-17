<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { formatAngkaIndonesia } from '~~/shared/utils/angka'

const properti = withDefaults(defineProps<{ total: number; perHalaman?: number }>(), { perHalaman: 20 })
const halaman = defineModel<number>({ required: true })
const totalHalaman = computed(() => Math.max(1, Math.ceil(properti.total / properti.perHalaman)))
const dari = computed(() => properti.total ? (halaman.value - 1) * properti.perHalaman + 1 : 0)
const sampai = computed(() => Math.min(properti.total, halaman.value * properti.perHalaman))
</script>

<template>
  <nav class="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between" aria-label="Paginasi">
    <p class="text-muted-foreground">Menampilkan <strong class="font-medium text-foreground">{{ formatAngkaIndonesia(dari) }}–{{ formatAngkaIndonesia(sampai) }}</strong> dari {{ formatAngkaIndonesia(total) }}</p>
    <div class="flex items-center gap-2">
      <span class="mr-1 text-muted-foreground">Halaman {{ halaman }} dari {{ totalHalaman }}</span>
      <Button variant="outline" size="icon-sm" :disabled="halaman <= 1" aria-label="Halaman sebelumnya" @click="halaman--"><ChevronLeft class="size-4" /></Button>
      <Button variant="outline" size="icon-sm" :disabled="halaman >= totalHalaman" aria-label="Halaman berikutnya" @click="halaman++"><ChevronRight class="size-4" /></Button>
    </div>
  </nav>
</template>
