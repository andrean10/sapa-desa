<script setup lang="ts">
import { APP_NAME, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'
import { TEKS_UMUM } from '~~/shared/config/teks'
</script>

<template>
  <footer class="border-t border-border bg-card">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-sm sm:px-8">
      <p class="font-bold text-primary">{{ APP_NAME }}</p>
      <p class="text-muted-foreground">{{ REGIONAL_OFFICE_NAME }}</p>
      <nav class="flex items-center gap-5">
        <NuxtLink class="font-semibold text-foreground no-underline hover:text-primary" to="/privasi">{{ TEKS_UMUM.privasi }}</NuxtLink>
        <NuxtLink class="font-semibold text-foreground no-underline hover:text-primary" to="/masuk">{{ TEKS_UMUM.identitasPetugas }}</NuxtLink>
      </nav>
    </div>
  </footer>
</template>
