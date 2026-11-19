import type { EmblaCarouselType as CarouselApi } from "embla-carousel"
import type { Ref } from "vue"
import type { CarouselProps } from "./interface"
import { inject, provide } from "vue"
import type emblaCarouselVue from "embla-carousel-vue"

export type UnwrapRefCarouselApi = CarouselApi

type EmblaVue = ReturnType<typeof emblaCarouselVue>

export interface CarouselContext {
  carouselRef: EmblaVue[0]
  carouselApi: EmblaVue[1]
  canScrollNext: Ref<boolean>
  canScrollPrev: Ref<boolean>
  scrollNext: () => void
  scrollPrev: () => void
  orientation: CarouselProps["orientation"]
}

const KUNCI = Symbol("carousel")

export function provideCarousel(context: CarouselContext) {
  provide(KUNCI, context)
}

export function useCarousel(): CarouselContext {
  const context = inject<CarouselContext>(KUNCI)
  if (!context) throw new Error("useCarousel harus dipakai di dalam <Carousel />")
  return context
}
