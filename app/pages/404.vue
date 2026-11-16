<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
definePageMeta({ layout: false })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <main class="grid min-h-svh place-items-center bg-muted/40 p-4"><Card class="w-full max-w-md"><CardHeader class="text-center"><CardTitle class="text-4xl">404</CardTitle><CardDescription>Halaman yang Anda cari tidak ditemukan.</CardDescription></CardHeader><CardContent class="flex justify-center"><Button as-child variant="outline"><NuxtLink to="/">Kembali ke beranda</NuxtLink></Button></CardContent></Card></main>
</template>
