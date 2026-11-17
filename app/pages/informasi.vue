<script setup lang="ts">
import FaqAccordion from '~/components/public/FaqAccordion.vue'
import { TEKS_FAQ } from '~~/shared/config/teks'

definePageMeta({ layout: 'publik' })
useHead({ title: TEKS_FAQ.judul })
const { data, pending, error, refresh } = await useFaq()
const cari = ref('')
const faq = computed(() => data.value ?? [])
const hasil = computed(() => {
  const istilah = cari.value.trim().toLocaleLowerCase('id')
  return !istilah ? faq.value : faq.value.filter(item => `${item.pertanyaan}\n${item.jawaban}`.toLocaleLowerCase('id').includes(istilah))
})
</script>

<template>
  <div class="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[.75fr_1.25fr] lg:gap-14">
    <aside class="lg:sticky lg:top-8 lg:self-start">
      <p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">{{ TEKS_FAQ.label }}</p>
      <h1 class="mt-3 text-4xl font-black leading-tight text-primary">{{ TEKS_FAQ.judul }}</h1>
    </aside>
    <section aria-label="Daftar pertanyaan">
      <label v-if="faq.length > 8" class="mb-5 grid gap-2 font-semibold" for="cari-faq">{{ TEKS_FAQ.cari }}<input id="cari-faq" v-model="cari" type="search" class="min-h-12 rounded-lg border border-border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring"></label>
      <div v-if="pending" class="grid gap-3" role="status" aria-label="Memuat informasi"><div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-xl bg-muted" /></div>
      <div v-else-if="error" class="rounded-xl border border-border bg-card p-6" role="alert"><p>{{ TEKS_FAQ.gagal }}</p><p class="mt-2 text-sm text-muted-foreground">Server tidak berhasil membaca daftar FAQ dari Supabase.</p><button class="mt-4 min-h-11 rounded-lg border border-border px-4 font-bold text-primary" type="button" @click="refresh()">{{ TEKS_FAQ.ulang }}</button></div>
      <FaqAccordion v-else-if="hasil.length" :items="hasil" />
      <div v-else class="rounded-xl border border-border bg-card p-6"><p class="leading-7 text-muted-foreground">{{ cari ? 'Tidak ada informasi yang cocok dengan pencarian.' : TEKS_FAQ.kosong }}</p></div>
    </section>
  </div>
</template>
