<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex min-w-0 flex-col gap-5 rounded-xl border border-border/80 py-5 shadow-sm sm:gap-6 sm:py-6',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
