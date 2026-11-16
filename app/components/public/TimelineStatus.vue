<script setup lang="ts">
import type { Enums } from '~~/shared/types/database.types'
import { STATUS_LAPORAN_TAMPILAN } from '~~/shared/config/teks'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'

export type ButirTimelinePublik = {
  status: Enums<'status_laporan'>
  keterangan?: string | null
  waktu: string
}

defineProps<{
  timeline: ButirTimelinePublik[]
  label?: string
}>()
</script>

<template>
  <ol class="grid gap-0" :aria-label="label ?? 'Riwayat status laporan'">
    <li
      v-for="(butir, index) in timeline"
      :key="`${butir.waktu}-${butir.status}-${index}`"
      class="grid gap-3 sm:grid-cols-[11rem_1fr] sm:gap-5"
      :class="index === timeline.length - 1 ? 'pb-1' : 'pb-6'"
    >
      <time class="order-1 text-sm text-muted-foreground sm:order-none" :datetime="butir.waktu">
        {{ formatTanggalWaktuWib(butir.waktu) }}
      </time>
      <div class="relative order-2 border-l-2 border-border pl-5 sm:order-none">
        <span
          class="absolute -left-[0.58rem] top-1 size-4 rounded-full border-2 border-card"
          :class="index === timeline.length - 1 ? 'scale-110' : ''"
          :style="{ backgroundColor: STATUS_LAPORAN_TAMPILAN.find(item => item.value === butir.status)?.warna.teks }"
          aria-hidden="true"
        />
        <StatusBadge :status="butir.status" />
        <p v-if="butir.keterangan" class="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{{ butir.keterangan }}</p>
      </div>
    </li>
  </ol>
</template>
