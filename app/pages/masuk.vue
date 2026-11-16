<script setup lang="ts">
import { TEKS_UMUM } from '~~/shared/config/teks'

definePageMeta({ layout: 'publik' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <section class="mx-auto grid min-h-80 max-w-xl content-center gap-4 px-5 py-12 text-center">
    <h1 class="text-3xl font-extrabold text-primary">{{ TEKS_UMUM.identitasPetugas }}</h1>
    <p class="text-muted-foreground">Halaman ini menjadi tujuan masuk petugas. Form autentikasi disiapkan pada tahap berikutnya.</p>
  </section>
</template>
