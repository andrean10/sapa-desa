<script setup lang="ts">
import { ArrowRight, BadgeCheck, CircleCheck, Landmark, Lock, MapPinned, ShieldCheck } from '@lucide/vue'
import { FOTO_LANDING } from '~~/shared/config/app'
import { TEKS_LANDING } from '~~/shared/config/teks'
import { formatAngkaIndonesia } from '~~/shared/utils/angka'

// Hero landing: PIMPASA. Tombol satu-satunya mengarah ke login petugas.
const teks = TEKS_LANDING.pimpasa
const { data: statistik } = useStatistikPublik()
</script>

<template>
  <section class="relative isolate overflow-hidden bg-linear-to-b from-info-muda/70 via-info-muda/25 to-background" aria-labelledby="judul-landing">
    <div class="pointer-events-none absolute -top-40 -left-32 -z-10 size-[28rem] rounded-full bg-card/70 blur-3xl" aria-hidden="true" />
    <div class="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-10 pb-0 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-6 lg:pt-8 lg:pb-0">
      <div class="relative z-10 max-w-2xl pb-2 lg:pb-16">
        <p class="inline-flex items-center gap-2 rounded-full border border-info/15 bg-card/80 px-3.5 py-1.5 text-sm font-semibold text-info shadow-xs backdrop-blur"><BadgeCheck class="size-4" aria-hidden="true" />{{ teks.label }}</p>
        <h1 id="judul-landing" class="mt-6 text-primary">
          <span class="block text-6xl leading-none font-extrabold tracking-tight sm:text-7xl lg:text-[5.5rem]">{{ teks.nama }}</span>
          <span class="mt-3 block text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl">{{ teks.kepanjangan }}</span>
        </h1>
        <p class="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">{{ teks.pengantar }}</p>
        <div class="mt-9 flex flex-col items-start gap-3">
          <NuxtLink to="/masuk" class="group inline-flex min-h-14 items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-lg font-extrabold tracking-wide text-primary-foreground no-underline shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none active:translate-y-0">
            <ShieldCheck class="size-5 text-emas" aria-hidden="true" />{{ teks.tombol }}<ArrowRight class="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </NuxtLink>
          <p class="flex items-center gap-1.5 text-sm text-muted-foreground"><Lock class="size-3.5" aria-hidden="true" />{{ teks.catatanTombol }}</p>
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-[32rem] lg:max-w-none">
        <div class="relative mx-auto aspect-[4/4.4] w-full max-w-[30rem] sm:aspect-[4/4.2] lg:ml-auto lg:max-w-[34rem]">
          <div class="absolute top-[3%] -right-[14%] aspect-square w-[104%] rounded-full bg-linear-to-b from-info-muda to-info-muda/30 ring-1 ring-info/10 lg:-right-[18%]" aria-hidden="true" />
          <span class="absolute top-[3%] left-[6%] size-7 rounded-t-full bg-emas" aria-hidden="true" />
          <span class="absolute top-[18%] left-[2%] size-3 rounded-full bg-info/60" aria-hidden="true" />
          <span class="absolute top-[40%] right-[1%] size-4 rounded-full bg-emas/80" aria-hidden="true" />
          <span class="absolute right-[10%] bottom-[22%] size-5 rotate-45 rounded-sm bg-info/30" aria-hidden="true" />
          <div class="absolute inset-x-[8%] top-[4%] bottom-0"><PublicLandingFoto :foto="FOTO_LANDING.pimpasa" prioritas /></div>

          <div v-if="statistik" class="absolute top-[5%] right-[-2%] flex animate-melayang items-center gap-3 rounded-2xl border border-border/60 bg-card/95 py-3 pr-5 pl-3 shadow-xl shadow-primary/10 backdrop-blur motion-reduce:animate-none sm:right-[-6%] lg:right-[-3%]">
            <span class="grid size-10 place-items-center rounded-xl bg-info-muda text-info" aria-hidden="true"><MapPinned class="size-5" /></span>
            <p class="leading-tight"><span class="block text-xl font-extrabold text-primary tabular-nums">{{ formatAngkaIndonesia(statistik.desaBinaan) }}</span><span class="block text-xs text-muted-foreground">{{ teks.kartu.desaBinaan }}</span></p>
          </div>
          <div class="absolute top-[40%] right-[-4%] hidden w-52 animate-melayang rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl shadow-primary/10 backdrop-blur [animation-delay:1.2s] motion-reduce:animate-none sm:block lg:right-[-8%]">
            <p class="text-sm font-bold text-primary">{{ teks.kartu.kegiatanJudul }}</p>
            <ul class="mt-2.5 grid gap-1.5">
              <li v-for="item in teks.kartu.kegiatan" :key="item" class="flex items-start gap-2 text-xs leading-snug text-muted-foreground"><CircleCheck class="mt-px size-3.5 shrink-0 text-sukses" aria-hidden="true" />{{ item }}</li>
            </ul>
          </div>
          <div v-if="statistik" class="absolute bottom-[10%] left-[-3%] flex animate-melayang items-center gap-3 rounded-2xl border border-border/60 bg-card/95 py-3 pr-5 pl-3 shadow-xl shadow-primary/10 backdrop-blur [animation-delay:2.4s] motion-reduce:animate-none sm:left-[-8%] lg:left-[-12%]">
            <span class="grid size-10 place-items-center rounded-xl bg-emas/20 text-emas-foreground" aria-hidden="true"><Landmark class="size-5" /></span>
            <p class="leading-tight"><span class="block text-xl font-extrabold text-primary tabular-nums">{{ statistik.kantor }} <span class="text-sm font-semibold text-muted-foreground">Kantor Imigrasi</span></span><span class="block text-xs text-muted-foreground">melayani {{ statistik.kabupaten }} kabupaten/kota</span></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
