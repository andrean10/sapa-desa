<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div data-slot="table-container" class="relative w-full min-w-0 overflow-x-auto overscroll-x-contain">
    <table data-slot="table" :class="cn('w-full min-w-[40rem] caption-bottom text-sm sm:min-w-full', props.class)">
      <slot />
    </table>
  </div>
</template>
