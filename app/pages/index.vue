<script setup lang="ts">
import { APP_NAME, APP_TAGLINE, ORGANIZATION_NAME } from '~~/shared/config/app'
import { NAVIGASI_PUBLIK, TEKS_FAQ, TEKS_LANDING, TEKS_UMUM } from '~~/shared/config/teks'

definePageMeta({ layout: 'publik' })
const { data, pending, error, refresh } = await useFaq()
const faq = computed(() => (data.value ?? []).slice(0, 5))

useHead({
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  meta: [
    { name: 'description', content: TEKS_LANDING.pengantar },
    { property: 'og:title', content: APP_NAME },
    { property: 'og:description', content: TEKS_LANDING.pengantar },
    { property: 'og:image', content: '/favicon.ico' },
    { property: 'og:type', content: 'website' }
  ]
})
</script>

<template>
  <div>
    <section class="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:gap-16">
      <div class="max-w-3xl">
        <p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">{{ ORGANIZATION_NAME }}</p>
        <h1 class="mt-4 text-4xl font-black leading-tight tracking-tight text-primary sm:text-6xl">{{ TEKS_LANDING.judul }}</h1>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{{ TEKS_LANDING.pengantar }}</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <NuxtLink class="inline-flex min-h-12 items-center rounded-lg bg-accent px-5 py-3 font-bold text-accent-foreground no-underline shadow-card transition hover:opacity-90" :to="NAVIGASI_PUBLIK[2].href">{{ NAVIGASI_PUBLIK[2].label }}</NuxtLink>
          <NuxtLink class="inline-flex min-h-12 items-center rounded-lg border border-primary px-5 py-3 font-bold text-primary no-underline hover:bg-secondary" to="/lacak">{{ TEKS_LANDING.cekStatus }}</NuxtLink>
        </div>
      </div>
      <aside class="relative overflow-hidden rounded-2xl bg-primary p-7 text-primary-foreground shadow-card sm:p-9" aria-label="Informasi layanan">
        <span class="pointer-events-none absolute -right-2 -top-8 text-8xl font-black tracking-tighter text-secondary" aria-hidden="true">RIAU</span>
        <p class="relative mt-8 text-sm">{{ ORGANIZATION_NAME }}</p>
        <p class="relative mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{{ APP_TAGLINE }}</p>
      </aside>
    </section>
    <section class="mx-auto max-w-7xl px-5 pb-14 sm:px-8" aria-labelledby="judul-cara-kerja">
      <h2 id="judul-cara-kerja" class="mb-6 text-2xl font-black text-primary">Cara menggunakan layanan</h2>
      <ol class="grid gap-4 md:grid-cols-3">
        <li v-for="(langkah, index) in TEKS_LANDING.langkah" :key="langkah.judul" class="rounded-xl border border-border bg-card p-6 shadow-sm">
          <span class="grid size-11 place-items-center rounded-full bg-secondary font-black text-secondary-foreground" aria-hidden="true">{{ index + 1 }}</span>
          <h3 class="mt-4 text-lg font-bold text-primary">{{ langkah.judul }}</h3>
          <p class="mt-2 leading-6 text-muted-foreground">{{ langkah.keterangan }}</p>
        </li>
      </ol>
    </section>
    <section v-if="pending || error || faq.length" class="bg-card px-5 py-14 sm:px-8" aria-labelledby="judul-faq-pintas">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div><p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Pusat informasi</p><h2 id="judul-faq-pintas" class="mt-2 text-3xl font-black text-primary">{{ TEKS_LANDING.faqJudul }}</h2></div>
          <NuxtLink class="min-h-11 content-center font-bold text-primary underline underline-offset-4" to="/informasi">{{ TEKS_LANDING.faqLihatSemua }}</NuxtLink>
        </div>
        <div v-if="pending" class="mt-7 grid gap-3 md:grid-cols-2" aria-label="Memuat informasi" role="status"><div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded-xl bg-muted" /></div>
        <div v-else-if="error" class="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-5" role="alert"><p class="text-muted-foreground">{{ TEKS_FAQ.gagal }}</p><button class="min-h-11 rounded-lg border border-border px-4 font-bold text-primary" type="button" @click="refresh()">{{ TEKS_FAQ.ulang }}</button></div>
        <ul v-else class="mt-7 grid gap-3 md:grid-cols-2"><li v-for="item in faq" :key="item.id"><NuxtLink class="block min-h-16 rounded-xl border border-border bg-background p-5 font-bold text-primary no-underline transition hover:border-primary" :to="`/informasi#faq-${item.id}`">{{ item.pertanyaan }}</NuxtLink></li></ul>
      </div>
    </section>
    <aside class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-10 sm:px-8" aria-label="Privasi lokasi">
      <p class="max-w-3xl leading-7 text-muted-foreground">{{ TEKS_LANDING.catatanPrivasi }}</p>
      <NuxtLink class="font-bold text-primary underline underline-offset-4" to="/privasi">{{ TEKS_UMUM.privasi }}</NuxtLink>
    </aside>
  </div>
</template>
