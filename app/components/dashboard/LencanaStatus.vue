<script setup lang="ts">
import type { Enums } from '~~/shared/types/database.types'
import { STATUS_LAPORAN_TAMPILAN } from '~~/shared/config/teks'

const properti = defineProps<{ status: Enums<'status_laporan'> }>()
const item = computed(() => STATUS_LAPORAN_TAMPILAN.find(status => status.value === properti.status))
</script>

<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold" :style="item ? { backgroundColor: item.warna.latar, color: item.warna.teks } : undefined">
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />{{ item?.label ?? status }}
  </span>
</template>
