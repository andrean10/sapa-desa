<script setup lang="ts">
import type { Enums } from '~~/shared/types/database.types'
import { STATUS_LAPORAN_TAMPILAN } from '~~/shared/config/teks'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'
import StatusBadge from '~/components/StatusBadge.vue'

export type ButirTimelinePublik = {
  status: Enums<'status_laporan'>
  keterangan?: string | null
  waktu: string
  /** Hanya diisi oleh halaman petugas. Halaman publik tidak boleh mengirim nama petugas. */
  petugas?: string | null
}

defineProps<{
  timeline: ButirTimelinePublik[]
  label?: string
}>()

const warnaStatus = (status: Enums<'status_laporan'>) => STATUS_LAPORAN_TAMPILAN.find(item => item.value === status)?.warna
</script>

<template>
  <ol :aria-label="label ?? 'Riwayat status aduan'">
    <li
      v-for="(butir, index) in timeline"
      :key="`${butir.waktu}-${butir.status}-${index}`"
      class="grid grid-cols-[2rem_1fr] gap-x-4"
      :aria-current="index === timeline.length - 1 ? 'step' : undefined"
    >
      <div class="flex flex-col items-center">
        <span
          class="z-10 grid size-8 shrink-0 place-items-center rounded-full text-white ring-4 ring-card"
          :class="index === timeline.length - 1 ? 'shadow-md' : ''"
          :style="{ backgroundColor: warnaStatus(butir.status)?.teks }"
          aria-hidden="true"
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" /></svg>
        </span>
        <span v-if="index < timeline.length - 1" class="my-1 w-0.5 flex-1 bg-border" aria-hidden="true" />
      </div>
      <div :class="index < timeline.length - 1 ? 'pb-8' : ''">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
          <StatusBadge :status="butir.status" />
          <time class="text-sm text-muted-foreground" :datetime="butir.waktu">{{ formatTanggalWaktuWib(butir.waktu) }}</time>
        </div>
        <p v-if="butir.keterangan" class="mt-3 whitespace-pre-wrap border-s-4 border-accent bg-muted p-4 text-sm leading-6 text-foreground">{{ butir.keterangan }}</p>
        <p v-if="butir.petugas" class="mt-2 text-sm text-muted-foreground">Oleh {{ butir.petugas }}</p>
      </div>
    </li>
  </ol>
</template>
