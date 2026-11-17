<script setup lang="ts">
import { APP_NAME, APP_TAGLINE, ORGANIZATION_NAME } from '~~/shared/config/app'
import { NAVIGASI_PUBLIK, TEKS_FAQ, TEKS_LANDING } from '~~/shared/config/teks'

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
    <section class="relative isolate overflow-hidden bg-primary text-primary-foreground" aria-labelledby="judul-landing">
      <div class="mx-auto grid min-h-[min(760px,calc(100svh-5rem))] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-16">
        <div class="relative z-10 max-w-3xl">
          <p class="text-sm font-bold leading-6 text-white/75">{{ ORGANIZATION_NAME }}</p>
          <h1 id="judul-landing" class="mt-7 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{{ TEKS_LANDING.judul }}</h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-white/80">{{ TEKS_LANDING.pengantar }}</p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <NuxtLink class="inline-flex min-h-12 items-center justify-center rounded-lg bg-accent px-6 py-3 font-bold text-accent-foreground no-underline transition duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0" :to="NAVIGASI_PUBLIK[2].href">{{ NAVIGASI_PUBLIK[2].label }}<span class="ml-3 text-lg" aria-hidden="true">→</span></NuxtLink>
            <NuxtLink class="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/40 px-6 py-3 font-bold text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0" to="/lacak">{{ TEKS_LANDING.cekStatus }}</NuxtLink>
          </div>
        </div>
        <aside class="relative flex min-h-72 items-end overflow-hidden border-l-4 border-accent pl-7 sm:min-h-80 sm:pl-10 lg:min-h-[28rem]" aria-label="Informasi layanan">
          <span class="pointer-events-none absolute -right-5 -top-12 select-none text-[clamp(10rem,24vw,22rem)] font-black leading-none tracking-[-.1em] text-white/[.07]" aria-hidden="true">RIAU</span>
          <div class="relative z-10 max-w-lg pb-2">
            <p class="text-sm font-bold leading-6 text-white/65">{{ ORGANIZATION_NAME }}</p>
            <p class="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{{ APP_TAGLINE }}</p>
          </div>
        </aside>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="judul-cara-kerja">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
        <h2 id="judul-cara-kerja" class="max-w-xl text-3xl font-black leading-tight text-primary sm:text-4xl">Cara menggunakan layanan</h2>
      </div>
      <ol class="grid gap-4 md:grid-cols-3">
        <li v-for="(langkah, index) in TEKS_LANDING.langkah" :key="langkah.judul" class="group relative flex min-h-56 flex-col rounded-xl border border-border bg-card p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card sm:p-8">
          <span class="flex size-12 items-center justify-center rounded-full bg-secondary text-lg font-extrabold text-secondary-foreground" aria-hidden="true">{{ index + 1 }}</span>
          <h3 class="mt-7 text-xl font-bold leading-snug text-primary">{{ langkah.judul }}</h3>
          <p class="mt-3 text-base leading-7 text-muted-foreground">{{ langkah.keterangan }}</p>
        </li>
      </ol>
    </section>
    <section v-if="pending || error || faq.length" class="bg-card px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="judul-faq-pintas">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div><p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Pusat informasi</p><h2 id="judul-faq-pintas" class="mt-3 text-3xl font-black text-primary sm:text-4xl">{{ TEKS_LANDING.faqJudul }}</h2></div>
          <NuxtLink class="inline-flex min-h-11 items-center font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 transition hover:text-foreground" to="/informasi">{{ TEKS_LANDING.faqLihatSemua }}<span class="ml-2" aria-hidden="true">→</span></NuxtLink>
        </div>
        <div v-if="pending" class="grid gap-3" aria-label="Memuat informasi" role="status"><div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded-lg bg-muted" /></div>
        <div v-else-if="error" class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background p-5" role="alert"><p class="text-muted-foreground">{{ TEKS_FAQ.gagal }}</p><button class="min-h-11 rounded-lg border border-border px-4 font-bold text-primary transition hover:bg-muted" type="button" @click="refresh()">{{ TEKS_FAQ.ulang }}</button></div>
        <ul v-else class="divide-y divide-border border-y border-border"><li v-for="item in faq" :key="item.id"><NuxtLink class="group flex min-h-16 items-center justify-between gap-5 py-5 font-bold text-primary no-underline transition hover:px-2" :to="`/informasi#faq-${item.id}`"><span>{{ item.pertanyaan }}</span><span class="shrink-0 text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></NuxtLink></li></ul>
      </div>
    </section>
  </div>
</template>
