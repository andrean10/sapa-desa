<script setup lang="ts">
const route = useRoute()
const desa = typeof route.query.desa === 'string' ? route.query.desa : ''
await navigateTo({ path: '/upt/kegiatan', query: { buat: '1', ...(desa && { desa }) } }, { redirectCode: 307 })
</script>

<template><span /></template>
