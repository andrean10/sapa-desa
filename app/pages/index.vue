<script setup lang="ts">
import { ArrowRight, Plus, ScanSearch, Smartphone, ShieldCheck } from '@lucide/vue'
import { APP_NAME, APP_TAGLINE } from '~~/shared/config/app'
import { TEKS_FAQ, TEKS_LANDING } from '~~/shared/config/teks'

definePageMeta({ layout: 'publik' })
const { data, pending, error, refresh, status } = useFaq()
const faq = computed(() => (data.value ?? []).slice(0, 5))
// FAQ diambil di browser; section baru disembunyikan setelah terbukti kosong (menjaga HTML server dan klien sama saat hidrasi).
const faqKosong = computed(() => status.value === 'success' && !faq.value.length && !error.value)
const IKON_LANGKAH = [Smartphone, ShieldCheck, ScanSearch]
const alur = TEKS_LANDING.alur

useHead({
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  meta: [
    { name: 'description', content: TEKS_LANDING.pimpasa.pengantar },
    { property: 'og:title', content: APP_NAME },
    { property: 'og:description', content: TEKS_LANDING.pimpasa.pengantar },
    { property: 'og:image', content: '/favicon.ico' },
    { property: 'og:type', content: 'website' }
  ]
})
</script>

<template>
  <div>
    <PublicHeroPimpasa />

    <div class="border-y border-border/70 bg-card px-5 py-6 sm:px-8"><div class="mx-auto max-w-7xl"><PublicLogoInstansi /></div></div>

    <PublicSectionAduan />

    <section class="border-y border-border/70 bg-card px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="judul-cara-kerja">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto max-w-2xl text-center">
          <p class="inline-flex rounded-full bg-info-muda px-3.5 py-1.5 text-sm font-bold text-info">{{ alur.label }}</p>
          <h2 id="judul-cara-kerja" class="mt-5 text-3xl leading-tight font-extrabold text-primary sm:text-4xl">{{ alur.judul }}</h2>
          <p class="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{{ alur.pengantar }}</p>
        </div>
        <ol class="relative mt-12 grid gap-5 md:grid-cols-3 lg:gap-8">
          <span class="pointer-events-none absolute top-[3.75rem] right-[16%] left-[16%] hidden border-t-2 border-dashed border-info/30 md:block" aria-hidden="true" />
          <li v-for="(langkah, index) in alur.langkah" :key="langkah.judul" class="group relative flex flex-col rounded-3xl border border-border bg-background p-7 transition duration-200 hover:-translate-y-1 hover:border-info/40 hover:shadow-card sm:p-8">
            <div class="flex items-center justify-between">
              <span class="relative grid size-[3.75rem] place-items-center rounded-2xl bg-linear-to-br from-info to-primary text-primary-foreground shadow-lg shadow-primary/20" aria-hidden="true"><component :is="IKON_LANGKAH[index]" class="size-7" /></span>
              <span class="text-5xl leading-none font-extrabold text-info/15 tabular-nums" aria-hidden="true">0{{ index + 1 }}</span>
            </div>
            <h3 class="mt-7 text-xl leading-snug font-extrabold text-primary"><span class="sr-only">Langkah {{ index + 1 }}: </span>{{ langkah.judul }}</h3>
            <p class="mt-3 text-base leading-7 text-muted-foreground">{{ langkah.keterangan }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="!faqKosong" class="bg-background px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="judul-faq-pintas">
      <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div class="lg:sticky lg:top-28 lg:self-start">
          <p class="inline-flex rounded-full bg-emas/20 px-3.5 py-1.5 text-sm font-bold text-emas-teks">{{ TEKS_LANDING.faqLabel }}</p>
          <h2 id="judul-faq-pintas" class="mt-5 text-3xl leading-tight font-extrabold text-primary sm:text-4xl">{{ TEKS_LANDING.faqJudul }}</h2>
          <p class="mt-4 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">{{ TEKS_LANDING.faqPengantar }}</p>
          <NuxtLink class="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-primary px-6 font-extrabold text-primary no-underline transition hover:bg-primary hover:text-primary-foreground" to="/informasi">{{ TEKS_LANDING.faqLihatSemua }}<ArrowRight class="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></NuxtLink>
        </div>
        <ClientOnly>
          <div v-if="pending" class="grid gap-3" aria-label="Memuat informasi" role="status"><div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-2xl bg-muted" /></div>
          <div v-else-if="error" class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6" role="alert"><p class="text-muted-foreground">{{ TEKS_FAQ.gagal }}</p><button class="min-h-11 rounded-full border border-border px-5 font-bold text-primary transition hover:bg-muted" type="button" @click="refresh()">{{ TEKS_FAQ.ulang }}</button></div>
          <ul v-else class="grid gap-3">
            <li v-for="item in faq" :key="item.id"><NuxtLink class="group flex min-h-[4.5rem] items-center justify-between gap-5 rounded-2xl border border-border bg-card px-6 py-4 font-bold text-primary no-underline shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-info/40 hover:shadow-card" :to="`/informasi#faq-${item.id}`"><span class="leading-snug">{{ item.pertanyaan }}</span><span class="grid size-9 shrink-0 place-items-center rounded-full bg-info-muda text-info transition group-hover:bg-primary group-hover:text-primary-foreground" aria-hidden="true"><Plus class="size-4" /></span></NuxtLink></li>
          </ul>
          <template #fallback><div class="grid gap-3" role="status" aria-label="Memuat informasi"><div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-2xl bg-muted" /></div></template>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>
