<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { CarouselEmits, CarouselProps, CarouselApi } from "./interface"
import { cn } from "cn"
import emblaCarouselVue from "embla-carousel-vue"
import { onMounted, ref } from "vue"
import { provideCarousel } from "./useCarousel"

const props = withDefaults(defineProps<CarouselProps & { class?: HTMLAttributes["class"] }>(), {
  orientation: "horizontal",
})
const emits = defineEmits<CarouselEmits>()

const [emblaNode, emblaApi] = emblaCarouselVue({
  ...props.opts,
  axis: props.orientation === "horizontal" ? "x" : "y",
}, props.plugins)

const canScrollPrev = ref(false)
const canScrollNext = ref(false)

function perbarui(api: CarouselApi) {
  canScrollPrev.value = api.canScrollPrev()
  canScrollNext.value = api.canScrollNext()
}
const scrollPrev = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()

function onKeyDown(event: KeyboardEvent) {
  const sebelumnya = props.orientation === "vertical" ? "ArrowUp" : "ArrowLeft"
  const berikutnya = props.orientation === "vertical" ? "ArrowDown" : "ArrowRight"
  if (event.key === sebelumnya) { event.preventDefault(); scrollPrev() }
  else if (event.key === berikutnya) { event.preventDefault(); scrollNext() }
}

onMounted(() => {
  const api = emblaApi.value
  if (!api) return
  emits("init-api", api)
  perbarui(api)
  api.on("init", perbarui)
  api.on("reInit", perbarui)
  api.on("select", perbarui)
})

defineExpose({ emblaApi, scrollPrev, scrollNext })

provideCarousel({
  carouselRef: emblaNode,
  carouselApi: emblaApi,
  canScrollPrev,
  canScrollNext,
  scrollPrev,
  scrollNext,
  orientation: props.orientation,
})
</script>

<template>
  <div
    :class="cn('relative', props.class)"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <slot :can-scroll-next="canScrollNext" :can-scroll-prev="canScrollPrev" :scroll-next="scrollNext" :scroll-prev="scrollPrev" />
  </div>
</template>
