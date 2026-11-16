<script setup lang="ts">
import { APP_NAME } from '~~/shared/config/app'
import { NAVIGASI_PUBLIK, TEKS_UMUM } from '~~/shared/config/teks'
</script>

<template>
  <header class="border-b border-border bg-card">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <NuxtLink class="font-extrabold tracking-tight text-primary no-underline" to="/">
        {{ APP_NAME }}
      </NuxtLink>

      <nav class="hidden items-center gap-5 md:flex" :aria-label="TEKS_UMUM.navigasiUtama">
        <NuxtLink
          v-for="item in NAVIGASI_PUBLIK"
          :key="item.href"
          :to="item.href"
          class="min-h-11 content-center font-semibold text-foreground no-underline hover:text-primary"
          :class="item.href === '/lapor' ? 'rounded-lg bg-accent px-4 text-accent-foreground hover:opacity-90' : ''"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <details class="relative md:hidden">
        <summary class="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-border text-primary" :aria-label="TEKS_UMUM.bukaMenu">
          <span aria-hidden="true">☰</span>
        </summary>
        <nav class="absolute right-0 z-20 mt-2 grid min-w-52 gap-1 rounded-xl border border-border bg-card p-2 shadow-card" :aria-label="TEKS_UMUM.navigasiUtama">
          <NuxtLink
            v-for="item in NAVIGASI_PUBLIK"
            :key="item.href"
            :to="item.href"
            class="min-h-11 content-center rounded-lg px-3 font-semibold text-foreground no-underline hover:bg-muted"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </details>
    </div>
  </header>
</template>
