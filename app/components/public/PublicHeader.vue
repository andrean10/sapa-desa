<script setup lang="ts">
import { APP_NAME } from '~~/shared/config/app'
import { NAVIGASI_PUBLIK, TEKS_UMUM } from '~~/shared/config/teks'

const route = useRoute()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-primary/10 bg-background/95 backdrop-blur">
    <div class="h-1 bg-accent" aria-hidden="true" />
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3 sm:px-8 sm:py-4">
      <NuxtLink class="group flex min-w-0 items-center gap-3 font-extrabold tracking-tight text-primary no-underline" to="/" :aria-label="APP_NAME">
        <span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary p-2 shadow-sm transition duration-200 group-hover:-translate-y-0.5 sm:size-16 sm:p-2.5">
          <img class="size-full object-contain" src="/images/logo.webp" alt="" width="64" height="64">
        </span>
        <span class="text-base leading-none sm:text-lg">{{ APP_NAME }}</span>
      </NuxtLink>

      <nav class="hidden items-center gap-7 md:flex" :aria-label="TEKS_UMUM.navigasiUtama">
        <NuxtLink
          v-for="item in NAVIGASI_PUBLIK"
          :key="item.href"
          :to="item.href"
          class="relative min-h-11 content-center text-sm font-bold text-foreground no-underline transition hover:text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100"
          :class="route.path === item.href
            ? 'text-primary after:scale-x-100'
            : ''"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <details class="relative md:hidden">
        <summary class="grid size-12 cursor-pointer list-none place-items-center rounded-xl text-primary transition hover:bg-muted" :aria-label="TEKS_UMUM.bukaMenu">
          <span class="text-xl leading-none" aria-hidden="true">☰</span>
        </summary>
        <nav class="absolute right-0 z-20 mt-3 grid min-w-64 gap-1 rounded-2xl bg-card p-3 shadow-card ring-1 ring-primary/10" :aria-label="TEKS_UMUM.navigasiUtama">
          <NuxtLink
            v-for="item in NAVIGASI_PUBLIK"
            :key="item.href"
            :to="item.href"
            class="min-h-12 content-center rounded-xl px-4 font-bold no-underline transition hover:bg-muted"
            :class="route.path === item.href ? 'text-primary' : 'text-foreground'"
          >
            {{ item.label }}
          </NuxtLink>
          <NuxtLink class="mt-1 min-h-12 content-center rounded-xl border-t border-border px-4 pt-2 font-bold text-primary no-underline" to="/masuk">{{ TEKS_UMUM.identitasPetugas }}</NuxtLink>
        </nav>
      </details>
    </div>
  </header>
</template>
