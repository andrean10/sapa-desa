<!-- Label kecil di atas isian filter; menjaga tinggi baris filter tetap rata. -->
<script setup lang="ts">
defineProps<{ label: string; for?: string }>()
</script>

<template>
  <label class="grid min-w-0 gap-1.5 text-xs font-medium text-muted-foreground" :for="$props.for"><span>{{ label }}</span><slot /></label>
</template>
