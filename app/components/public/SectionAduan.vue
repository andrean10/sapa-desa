<script setup lang="ts">
import { Check, FilePlus2, SearchCheck, Smartphone } from '@lucide/vue'
import { FOTO_LANDING } from '~~/shared/config/app'
import { NAVIGASI_PUBLIK, TEKS_LANDING } from '~~/shared/config/teks'

// Section pelaporan masyarakat (tujuan utama pengunjung). Dua tombol dengan warna berbeda.
const teks = TEKS_LANDING.aduan
</script>

<template>
  <section class="bg-background px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="judul-aduan">
    <div class="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
      <div class="relative mx-auto w-full max-w-md lg:max-w-none">
        <div class="relative aspect-square w-full">
          <div class="absolute inset-[6%] rounded-[2.5rem] rounded-tr-[45%] bg-linear-to-br from-info to-primary" aria-hidden="true" />
          <span class="absolute top-0 left-[6%] size-5 rounded-full border-4 border-emas" aria-hidden="true" />
          <span class="absolute right-[2%] bottom-[30%] text-2xl leading-none font-bold text-destructive/70" aria-hidden="true">×</span>
          <div class="absolute inset-x-[14%] top-[8%] bottom-[6%]"><PublicLandingFoto :foto="FOTO_LANDING.aduan" /></div>
          <div class="absolute top-[22%] left-[-3%] animate-melayang rounded-2xl border border-border/60 bg-card p-3.5 shadow-xl shadow-primary/15 motion-reduce:animate-none sm:left-[-8%]">
            <p class="text-xs text-muted-foreground">{{ teks.kartuKode }}</p>
            <p class="mt-0.5 font-mono text-sm font-bold tracking-wider text-primary">SD-7KQ2-M9XP</p>
            <div class="mt-2"><StatusBadge status="ditindaklanjuti" /></div>
          </div>
          <div class="absolute right-[-2%] bottom-[14%] flex animate-melayang items-center gap-3 rounded-2xl border border-border/60 bg-card py-3 pr-5 pl-3 shadow-xl shadow-primary/15 [animation-delay:1.5s] motion-reduce:animate-none sm:right-[-6%]">
            <span class="grid size-10 place-items-center rounded-xl bg-sukses-muda text-sukses" aria-hidden="true"><Smartphone class="size-5" /></span>
            <p class="text-sm leading-tight font-bold text-primary">Tanpa akun<span class="block text-xs font-normal text-muted-foreground">cukup lewat HP</span></p>
          </div>
        </div>
      </div>

      <div class="max-w-xl">
        <p class="inline-flex rounded-full bg-emas/20 px-3.5 py-1.5 text-sm font-bold text-emas-foreground">{{ teks.label }}</p>
        <h2 id="judul-aduan" class="mt-5 text-3xl leading-tight font-extrabold text-primary sm:text-4xl lg:text-[2.6rem]">{{ teks.judul }}</h2>
        <p class="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">{{ teks.pengantar }}</p>
        <ul class="mt-7 grid gap-4">
          <li v-for="poin in teks.poin" :key="poin" class="flex items-start gap-3.5">
            <span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sukses text-white" aria-hidden="true"><Check class="size-3.5" stroke-width="3" /></span>
            <span class="leading-7 font-medium text-foreground">{{ poin }}</span>
          </li>
        </ul>
        <div class="mt-9 flex flex-col gap-3 sm:flex-row">
          <NuxtLink :to="NAVIGASI_PUBLIK[2].href" class="group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-emas px-7 py-3.5 text-base font-extrabold text-emas-foreground no-underline shadow-lg shadow-emas/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none active:translate-y-0"><FilePlus2 class="size-5" aria-hidden="true" />{{ teks.tombolAduan }}</NuxtLink>
          <NuxtLink :to="NAVIGASI_PUBLIK[3].href" class="group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-base font-extrabold text-primary-foreground no-underline shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none active:translate-y-0"><SearchCheck class="size-5" aria-hidden="true" />{{ teks.tombolCek }}</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
