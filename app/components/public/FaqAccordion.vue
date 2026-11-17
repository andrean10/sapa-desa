<script setup lang="ts">
import type { FaqPublik } from '~~/shared/types/publik'

const properti = withDefaults(defineProps<{
  items: FaqPublik[]
  idPrefix?: string
}>(), {
  idPrefix: 'faq'
})

const terbukaId = ref(properti.items[0]?.id ?? '')

watch(() => properti.items, (items) => {
  terbukaId.value = items[0]?.id ?? ''
}, { immediate: true })

function toggle(id: string) {
  terbukaId.value = terbukaId.value === id ? '' : id
}
</script>

<template>
  <div class="border-y border-border">
    <article v-for="item in items" :id="`${idPrefix}-${item.id}`" :key="item.id" class="border-b border-border last:border-b-0">
      <h2>
        <button
          class="group flex min-h-18 w-full items-center justify-between gap-6 py-5 text-left text-lg font-bold text-primary transition sm:py-6 sm:text-xl"
          type="button"
          :aria-expanded="terbukaId === item.id"
          :aria-controls="`${idPrefix}-jawaban-${item.id}`"
          @click="toggle(item.id)"
        >
          <span>{{ item.pertanyaan }}</span>
          <span class="shrink-0 text-2xl font-normal leading-none text-accent transition duration-200 group-hover:translate-x-1" :class="terbukaId === item.id ? 'rotate-45' : ''" aria-hidden="true">+</span>
        </button>
      </h2>
      <div v-if="terbukaId === item.id" :id="`${idPrefix}-jawaban-${item.id}`" class="max-w-3xl pb-6 pr-10 sm:pb-7">
        <p class="whitespace-pre-wrap text-base leading-7 text-muted-foreground">{{ item.jawaban }}</p>
      </div>
    </article>
  </div>
</template>
