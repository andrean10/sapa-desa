<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card-footer"
    :class="cn('flex min-w-0 items-center px-4 sm:px-6 [.border-t]:pt-6', props.class)"
  >
    <slot />
  </div>
</template>
