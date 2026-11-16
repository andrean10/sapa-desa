<script setup lang="ts">
import { TEKS_PRIVASI } from '~~/shared/config/teks'
definePageMeta({ layout: 'publik' })
useHead({ title: TEKS_PRIVASI.judul })
</script>

<template>
  <article class="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
    <p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">SAPA DESA</p>
    <h1 class="mt-3 text-4xl font-black tracking-tight text-primary">{{ TEKS_PRIVASI.judul }}</h1>
    <p class="mt-6 rounded-xl border border-border bg-card p-6 leading-7 text-muted-foreground">{{ TEKS_PRIVASI.isi }}</p>
  </article>
</template>
