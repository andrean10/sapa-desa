<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NotifikasiGlobal />
  </div>
</template>

<script setup lang="ts">
import { buatGayaTema } from '~~/shared/config/tema'

useHead({
  htmlAttrs: {
    style: buatGayaTema()
  }
})
</script>
