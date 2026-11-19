<script setup lang="ts">
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel'
import type { CarouselApi } from '~/components/ui/carousel'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog'

// Galeri foto seperti di HP: kisi gambar kecil, klik membuka penampil layar penuh yang bisa digeser
// (swipe, tombol panah, atau tombol keyboard) tanpa berpindah halaman.
const props = defineProps<{ fotos: string[]; label?: string }>()
const nama = computed(() => props.label ?? 'Foto')

const terbuka = ref(false)
const awal = ref(0)
const aktif = ref(0)
const api = ref<CarouselApi>()

function buka(indeks: number) {
  awal.value = indeks
  aktif.value = indeks
  terbuka.value = true
}
function siapkan(instance: CarouselApi) {
  api.value = instance
  aktif.value = instance.selectedScrollSnap()
  instance.on('select', () => { aktif.value = instance.selectedScrollSnap() })
}
watch(terbuka, (nilai) => { if (!nilai) api.value = undefined })
</script>

<template>
  <div v-if="fotos.length">
    <ul class="grid gap-2" :class="fotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'">
      <li v-for="(url, indeks) in fotos" :key="url">
        <button type="button" class="group relative block w-full overflow-hidden rounded-lg border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50" :aria-label="`Buka ${nama} ${indeks + 1} dari ${fotos.length}`" @click="buka(indeks)">
          <img :src="url" :alt="`${nama} ${indeks + 1}`" class="aspect-[4/3] w-full object-cover transition duration-200 group-hover:scale-105" loading="lazy">
        </button>
      </li>
    </ul>

    <Dialog v-model:open="terbuka">
      <DialogContent class="max-w-[calc(100%-1rem)] gap-0 border-0 bg-black/95 p-0 text-white sm:max-w-4xl" :show-close-button="true">
        <DialogTitle class="sr-only">{{ nama }}</DialogTitle>
        <DialogDescription class="sr-only">Geser atau gunakan tombol panah untuk melihat foto lainnya.</DialogDescription>
        <Carousel class="w-full" :opts="{ startIndex: awal, loop: false }" @init-api="siapkan">
          <CarouselContent class="ml-0">
            <CarouselItem v-for="(url, indeks) in fotos" :key="url" class="pl-0">
              <div class="flex h-[75svh] items-center justify-center">
                <img :src="url" :alt="`${nama} ${indeks + 1}`" class="max-h-full max-w-full object-contain">
              </div>
            </CarouselItem>
          </CarouselContent>
          <template v-if="fotos.length > 1">
            <CarouselPrevious class="border-white/20 bg-black/60 text-white hover:bg-black/80 hover:text-white" />
            <CarouselNext class="border-white/20 bg-black/60 text-white hover:bg-black/80 hover:text-white" />
          </template>
        </Carousel>
        <p class="py-3 text-center text-sm text-white/80 tabular-nums" aria-live="polite">{{ aktif + 1 }} / {{ fotos.length }}</p>
      </DialogContent>
    </Dialog>
  </div>
</template>
