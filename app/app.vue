<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster rich-colors position="bottom-right" />
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
