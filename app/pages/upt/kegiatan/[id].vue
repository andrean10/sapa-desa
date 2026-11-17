<script setup lang="ts">
const route = useRoute()
await navigateTo({ path: '/upt/kegiatan', query: { edit: String(route.params.id) } }, { redirectCode: 307 })
</script>

<template><span /></template>
