<script setup lang="ts">
import { ArrowRight, FilePlus2, Mail, MapPin, Phone, SearchCheck, ShieldCheck } from '@lucide/vue'
import { APP_NAME, KONTAK_INSTANSI, PUBLIC_BRAND_NAME, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'
import { NAVIGASI_PUBLIK, TEKS_LANDING, TEKS_UMUM } from '~~/shared/config/teks'

const route = useRoute()
const tahunSekarang = new Date().getFullYear()
// Blok ajakan hanya di halaman informasi; di landing sudah ada section aduan, di /lapor dan /lacak tidak perlu.
const tampilkanAjakan = computed(() => route.path === '/informasi')
const kontak = KONTAK_INSTANSI
const sosial = [
  { nama: 'instagram' as const, label: kontak.instagram.nama, url: kontak.instagram.url, aksesibel: 'Instagram Imigrasi Riau' },
  { nama: 'tiktok' as const, label: kontak.tiktok.nama, url: kontak.tiktok.url, aksesibel: 'TikTok Imigrasi Riau' }
]
</script>

<template>
  <footer class="relative bg-primary text-primary-foreground" :class="tampilkanAjakan ? 'mt-28 sm:mt-24' : ''">
    <div class="h-1 bg-linear-to-r from-emas via-emas/60 to-transparent" aria-hidden="true" />
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div v-if="tampilkanAjakan" class="-translate-y-1/2 rounded-3xl bg-linear-to-br from-info to-primary p-7 shadow-2xl shadow-primary/30 ring-1 ring-white/15 sm:p-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-xl"><p class="text-2xl font-extrabold sm:text-3xl">{{ TEKS_LANDING.footerAjakanJudul }}</p><p class="mt-2 text-white/75">{{ TEKS_LANDING.footerAjakanIsi }}</p></div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/lapor" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emas px-6 font-extrabold text-emas-foreground no-underline transition hover:-translate-y-0.5 hover:brightness-105"><FilePlus2 class="size-5" aria-hidden="true" />{{ TEKS_LANDING.aduan.tombolAduan }}</NuxtLink>
            <NuxtLink to="/lacak" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-6 font-extrabold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/10"><SearchCheck class="size-5" aria-hidden="true" />{{ TEKS_LANDING.aduan.tombolCek }}</NuxtLink>
          </div>
        </div>
      </div>

      <div class="grid gap-12 pb-12 lg:grid-cols-[1.4fr_.7fr_1.2fr] lg:gap-16" :class="tampilkanAjakan ? '-mt-4 sm:-mt-2' : 'pt-14 sm:pt-20'">
        <div class="max-w-md">
          <NuxtLink class="group inline-flex items-center gap-3.5 text-primary-foreground no-underline" to="/" :aria-label="PUBLIC_BRAND_NAME">
            <span class="grid size-16 shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-emas/60"><img class="size-full object-contain transition duration-200 group-hover:scale-105" src="/images/logo.webp" alt="" width="64" height="64"></span>
            <span class="flex flex-col text-xs leading-[1.25] font-extrabold tracking-[0.08em]"><span>SISTEM PELAPORAN</span><span>PEMANTAUAN AKTIFITAS</span><span>DESA BINAAN IMIGRASI</span></span>
          </NuxtLink>
          <p class="mt-6 text-xl leading-snug font-bold sm:text-2xl">{{ TEKS_LANDING.footerDeskripsi }}</p>
          <p class="mt-4 text-sm leading-6 text-white/65">{{ REGIONAL_OFFICE_NAME }}</p>
          <div class="mt-7 rounded-2xl bg-white p-4 shadow-lg"><PublicLogoInstansi tinggi="h-10" tanpa-teks /></div>
        </div>

        <div>
          <p class="text-xs font-extrabold tracking-[.18em] text-emas uppercase">Jelajahi</p>
          <nav class="mt-5 grid gap-3" aria-label="Navigasi footer">
            <NuxtLink v-for="item in NAVIGASI_PUBLIK" :key="item.href" class="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white" :to="item.href"><ArrowRight class="size-3.5 -translate-x-1 text-emas opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />{{ item.label }}</NuxtLink>
          </nav>
          <p class="mt-8 text-xs font-extrabold tracking-[.18em] text-emas uppercase">Untuk petugas</p>
          <NuxtLink class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white no-underline transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10" to="/masuk"><ShieldCheck class="size-4 text-emas" aria-hidden="true" />{{ TEKS_LANDING.pimpasa.tombol }}</NuxtLink>
        </div>

        <div>
          <p class="text-xs font-extrabold tracking-[.18em] text-emas uppercase">Hubungi kami</p>
          <ul class="mt-5 grid gap-4 text-sm">
            <li class="flex items-start gap-3"><span class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emas" aria-hidden="true"><MapPin class="size-4" /></span><address class="leading-6 text-white/80 not-italic">{{ kontak.alamat }}</address></li>
            <li class="flex items-center gap-3"><span class="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emas" aria-hidden="true"><Phone class="size-4" /></span><a :href="kontak.telepon.href" class="text-white/80 no-underline transition hover:text-white">{{ kontak.telepon.label }}</a></li>
            <li class="flex items-center gap-3"><span class="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emas" aria-hidden="true"><Mail class="size-4" /></span><a :href="`mailto:${kontak.email}`" class="break-all text-white/80 no-underline transition hover:text-white">{{ kontak.email }}</a></li>
          </ul>
          <div class="mt-6 flex flex-wrap gap-3">
            <a v-for="item in sosial" :key="item.nama" :href="item.url" target="_blank" rel="noopener noreferrer" :aria-label="item.aksesibel" class="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/20"><PublicIkonSosial :nama="item.nama" />{{ item.label }}</a>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 py-6 text-xs text-white/55">
        <p>© {{ tahunSekarang }} {{ APP_NAME }} · {{ REGIONAL_OFFICE_NAME }}</p>
        <p>{{ TEKS_UMUM.identitasPetugas }}: <NuxtLink to="/masuk" class="font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">{{ TEKS_LANDING.pimpasa.tombol }}</NuxtLink></p>
      </div>
    </div>
  </footer>
</template>
