<script setup lang="ts">
// Tab cepat berupa tautan (agar dapat dibagikan lewat URL) atau tombol biasa.
export type ItemSegmen = { value: string; label: string; to?: string; jumlah?: number; bahaya?: boolean }
defineProps<{ items: ItemSegmen[]; aktif: string; label: string }>()
defineEmits<{ pilih: [value: string] }>()
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <nav class="-mx-1 overflow-x-auto px-1" :aria-label="label">
    <div class="inline-flex min-w-max items-center gap-1 rounded-lg border bg-muted/60 p-1">
      <component
        :is="item.to ? NuxtLink : 'button'"
        v-for="item in items"
        :key="item.value"
        :to="item.to"
        :type="item.to ? undefined : 'button'"
        :aria-current="aktif === item.value ? 'page' : undefined"
        class="inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap no-underline transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        :class="aktif === item.value ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'"
        @click="!item.to && $emit('pilih', item.value)"
      >
        {{ item.label }}
        <span v-if="item.jumlah !== undefined" class="min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums" :class="item.bahaya && item.jumlah > 0 ? 'bg-destructive text-white' : 'bg-muted text-muted-foreground'">{{ item.jumlah }}</span>
      </component>
    </div>
  </nav>
</template>
