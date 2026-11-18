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
  <div>
    <section class="bg-primary text-primary-foreground">
      <div class="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-[.18em] text-accent">{{ TEKS_FAQ.label }}</p>
          <h1 class="mt-5 max-w-3xl text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl">{{ TEKS_FAQ.judul }}</h1>
        </div>
        <p class="max-w-md text-lg leading-8 text-white/75">Panduan singkat seputar layanan keimigrasian sebelum Anda menyampaikan aduan.</p>
      </div>
    </section>
    <section class="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20" aria-label="Daftar pertanyaan">
      <div>
          <label v-if="faq.length > 8" class="mb-8 grid gap-2 text-sm font-bold text-primary" for="cari-faq"><span>{{ TEKS_FAQ.cari }}</span><input id="cari-faq" v-model="cari" type="search" class="min-h-13 rounded-xl bg-muted px-5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary" :placeholder="TEKS_FAQ.cari"></label>
          <div v-if="pending" class="grid gap-3" role="status" aria-label="Memuat informasi"><div v-for="n in 5" :key="n" class="h-20 animate-pulse rounded-xl bg-muted" /></div>
          <div v-else-if="error" class="bg-muted p-6 sm:p-8" role="alert"><p class="text-xl font-extrabold text-primary">{{ TEKS_FAQ.gagal }}</p><p class="mt-3 max-w-xl leading-7 text-muted-foreground">Server tidak berhasil membaca daftar FAQ dari Supabase.</p><button class="mt-6 min-h-11 rounded-lg bg-primary px-5 font-bold text-primary-foreground transition hover:-translate-y-0.5" type="button" @click="refresh()">{{ TEKS_FAQ.ulang }}</button></div>
          <FaqAccordion v-else-if="hasil.length" :items="hasil" />
          <div v-else class="bg-muted p-6 sm:p-8"><p class="leading-7 text-muted-foreground">{{ cari ? 'Tidak ada informasi yang cocok dengan pencarian.' : TEKS_FAQ.kosong }}</p></div>
      </div>
    </section>
  </div>
</template>
