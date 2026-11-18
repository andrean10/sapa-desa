<script setup lang="ts">
// Foto landing (cutout transparan). Bila berkas belum ada di `public/images/landing/`, tampilkan ilustrasi pengganti
// berukuran sama agar tata letak tidak berubah.
type Foto = { src: string; alt: string; lebar: number; tinggi: number }
const properti = defineProps<{ foto: Foto; prioritas?: boolean }>()
const gagal = ref(false)
const gambar = useTemplateRef<HTMLImageElement>('gambar')
// Galat muat bisa terjadi sebelum hidrasi; periksa ulang setelah terpasang.
onMounted(() => { if (gambar.value?.complete && gambar.value.naturalWidth === 0) gagal.value = true })
const isDev = import.meta.dev
const rasio = computed(() => `${properti.foto.lebar} / ${properti.foto.tinggi}`)
</script>

<template>
  <img
    v-if="!gagal"
    ref="gambar"
    :src="foto.src"
    :alt="foto.alt"
    :width="foto.lebar"
    :height="foto.tinggi"
    :fetchpriority="prioritas ? 'high' : 'auto'"
    :loading="prioritas ? 'eager' : 'lazy'"
    decoding="async"
    class="h-full w-full object-contain object-bottom"
    @error="gagal = true"
  >
  <div v-else class="relative grid h-full w-full place-items-end justify-items-center" role="img" :aria-label="foto.alt" :style="{ aspectRatio: rasio }">
    <svg viewBox="0 0 240 300" class="h-[88%] w-auto text-primary" fill="none" aria-hidden="true">
      <circle cx="120" cy="86" r="42" class="fill-primary/20" />
      <path d="M30 300c2-58 36-96 90-96s88 38 90 96z" class="fill-primary/20" />
    </svg>
    <p v-if="isDev" class="absolute top-1/2 left-1/2 w-3/4 -translate-x-1/2 rounded-lg bg-card/90 px-3 py-2 text-center text-xs font-semibold text-muted-foreground shadow-sm">Taruh foto di {{ foto.src }}</p>
  </div>
</template>
