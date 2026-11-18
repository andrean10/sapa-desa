<script setup lang="ts">
import { Menu, ShieldCheck, X } from '@lucide/vue'
import { PUBLIC_BRAND_NAME, APP_NAME } from '~~/shared/config/app'
import { NAVIGASI_PUBLIK, TEKS_LANDING, TEKS_UMUM } from '~~/shared/config/teks'

const route = useRoute()
const menuMobile = ref<HTMLDetailsElement>()
const menuTerbuka = ref(false)

watch(() => route.fullPath, () => { if (menuMobile.value) menuMobile.value.open = false; menuTerbuka.value = false })
function tutupMenu() { if (menuMobile.value) menuMobile.value.open = false; menuTerbuka.value = false }
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2.5 sm:gap-6 sm:px-8 sm:py-3">
      <NuxtLink class="group flex min-w-0 items-center gap-3 text-primary no-underline" to="/" :aria-label="PUBLIC_BRAND_NAME">
        <img class="size-11 shrink-0 object-contain transition duration-200 group-hover:-translate-y-0.5 sm:size-14" src="/images/logo.webp" alt="" width="56" height="56">
        <span class="hidden min-w-0 flex-col justify-center text-[0.7rem] leading-[1.25] font-extrabold tracking-[0.07em] lg:flex xl:text-xs">
          <span class="block">SISTEM PELAPORAN</span><span class="block">PEMANTAUAN AKTIFITAS</span><span class="block">DESA BINAAN IMIGRASI</span>
        </span>
        <span class="text-base leading-none font-extrabold tracking-wide whitespace-nowrap sm:text-lg lg:hidden">{{ APP_NAME }}</span>
      </NuxtLink>

      <nav class="ml-auto hidden items-center gap-1 md:flex" :aria-label="TEKS_UMUM.navigasiUtama">
        <NuxtLink
          v-for="item in NAVIGASI_PUBLIK"
          :key="item.href"
          :to="item.href"
          class="relative rounded-full px-4 py-2 text-sm font-bold no-underline transition hover:bg-info-muda/70 hover:text-primary"
          :class="route.path === item.href ? 'bg-info-muda text-primary' : 'text-foreground/80'"
          :aria-current="route.path === item.href ? 'page' : undefined"
        >{{ item.label }}</NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <details ref="menuMobile" class="relative md:hidden" @toggle="menuTerbuka = menuMobile?.open ?? false">
          <summary class="grid size-11 cursor-pointer list-none place-items-center rounded-full text-primary transition hover:bg-info-muda focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none [&::-webkit-details-marker]:hidden" :aria-label="menuTerbuka ? TEKS_UMUM.tutup : TEKS_UMUM.bukaMenu">
            <X v-if="menuTerbuka" class="size-6" aria-hidden="true" /><Menu v-else class="size-6" aria-hidden="true" />
          </summary>
          <nav class="absolute right-0 z-20 mt-3 grid w-64 gap-1 rounded-2xl bg-card p-2.5 shadow-2xl shadow-primary/15 ring-1 ring-border" :aria-label="TEKS_UMUM.navigasiUtama">
            <NuxtLink v-for="item in NAVIGASI_PUBLIK" :key="item.href" :to="item.href" class="min-h-12 content-center rounded-xl px-4 font-bold no-underline transition hover:bg-info-muda/70" :class="route.path === item.href ? 'bg-info-muda text-primary' : 'text-foreground'" @click="tutupMenu">{{ item.label }}</NuxtLink>
            <NuxtLink class="mt-1 flex min-h-12 items-center gap-2 rounded-xl border-t border-border px-4 pt-2 font-bold text-primary no-underline hover:bg-info-muda/70" to="/masuk" @click="tutupMenu"><ShieldCheck class="size-4 text-emas-foreground" aria-hidden="true" />{{ TEKS_LANDING.pimpasa.tombol }} · {{ TEKS_UMUM.identitasPetugas }}</NuxtLink>
          </nav>
        </details>
      </div>
    </div>
  </header>
</template>
