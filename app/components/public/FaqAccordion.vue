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
  <div class="grid gap-3">
    <article v-for="item in items" :id="`${idPrefix}-${item.id}`" :key="item.id" class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <h2>
        <button
          class="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-primary"
          type="button"
          :aria-expanded="terbukaId === item.id"
          :aria-controls="`${idPrefix}-jawaban-${item.id}`"
          @click="toggle(item.id)"
        >
          <span>{{ item.pertanyaan }}</span>
          <span class="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-lg" aria-hidden="true">{{ terbukaId === item.id ? '×' : '+' }}</span>
        </button>
      </h2>
      <div v-if="terbukaId === item.id" :id="`${idPrefix}-jawaban-${item.id}`" class="border-t border-border px-5 py-4">
        <p class="whitespace-pre-wrap leading-7 text-muted-foreground">{{ item.jawaban }}</p>
      </div>
    </article>
  </div>
</template>
