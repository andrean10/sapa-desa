<script setup lang="ts">
definePageMeta({ layout: 'publik' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <section class="mx-auto grid min-h-80 max-w-xl content-center gap-4 px-5 py-12 text-center">
    <h1 class="text-3xl font-extrabold text-primary">404</h1>
    <p class="text-muted-foreground">Halaman yang Anda cari tidak ditemukan.</p>
    <NuxtLink class="font-semibold text-primary" to="/">Kembali ke beranda</NuxtLink>
  </section>
</template>
