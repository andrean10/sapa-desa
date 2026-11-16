<script setup lang="ts">
const route = useRoute()
await navigateTo(`/upt/kegiatan/baru?id=${encodeURIComponent(String(route.params.id))}`, { redirectCode: 307 })
</script>

<template><span /></template>
