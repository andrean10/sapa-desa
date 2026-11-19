<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ChevronRight } from "@lucide/vue"
import { cn } from "cn"
import { Button } from "~/components/ui/button"
import { useCarousel } from "./useCarousel"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
const { canScrollNext, scrollNext } = useCarousel()
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    type="button"
    aria-label="Foto berikutnya"
    :disabled="!canScrollNext"
    :class="cn('absolute top-1/2 right-2 size-9 -translate-y-1/2 rounded-full bg-background/90 shadow', props.class)"
    @click="scrollNext"
  >
    <slot><ChevronRight /></slot>
  </Button>
</template>
