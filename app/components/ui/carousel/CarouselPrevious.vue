<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ChevronLeft } from "@lucide/vue"
import { cn } from "cn"
import { Button } from "~/components/ui/button"
import { useCarousel } from "./useCarousel"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
const { canScrollPrev, scrollPrev } = useCarousel()
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    type="button"
    aria-label="Foto sebelumnya"
    :disabled="!canScrollPrev"
    :class="cn('absolute top-1/2 left-2 size-9 -translate-y-1/2 rounded-full bg-background/90 shadow', props.class)"
    @click="scrollPrev"
  >
    <slot><ChevronLeft /></slot>
  </Button>
</template>
