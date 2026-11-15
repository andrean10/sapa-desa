<template>
  <div :style="themeStyle">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { THEME_CSS_VARIABLES } from '~~/shared/config/app'

const themeStyle = THEME_CSS_VARIABLES as CSSProperties
</script>
