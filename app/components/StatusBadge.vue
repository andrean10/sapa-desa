<script setup lang="ts">
import type { Enums } from '~~/shared/types/database.types'
import { STATUS_LAPORAN_TAMPILAN } from '~~/shared/config/teks'

const properti = defineProps<{ status: Enums<'status_laporan'> }>()
const konfigurasiStatus = computed(() => STATUS_LAPORAN_TAMPILAN.find(item => item.value === properti.status))
</script>

<template>
  <span
    class="inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold"
    :style="konfigurasiStatus ? { backgroundColor: konfigurasiStatus.warna.latar, color: konfigurasiStatus.warna.teks } : undefined"
  >
    {{ konfigurasiStatus?.label ?? status }}
  </span>
</template>
