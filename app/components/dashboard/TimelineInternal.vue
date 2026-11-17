<script setup lang="ts">
import type { Enums } from '~~/shared/types/database.types'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'

// Timeline internal petugas: menampilkan "oleh {petugas}" (tidak pernah tampil ke masyarakat).
// Butir Ditolak ditonjolkan agar alasan penolakan mudah dibaca (PRD 8.4).
defineProps<{ items: { id: string; status: Enums<'status_laporan'>; keterangan: string | null; created_at: string; nama_pegawai: string | null }[] }>()
</script>

<template>
  <ol class="relative grid gap-5">
    <li v-for="(item, index) in items" :key="item.id" class="relative grid grid-cols-[1.25rem_1fr] gap-3">
      <span v-if="index < items.length - 1" class="absolute top-5 bottom-[-1.25rem] left-[0.5625rem] w-px bg-border" aria-hidden="true" />
      <span class="relative z-10 mt-1 grid size-5 place-items-center rounded-full border-2 bg-card" :class="index === items.length - 1 ? (item.status === 'ditolak' ? 'border-destructive' : 'border-primary') : 'border-border'" aria-hidden="true">
        <span class="size-2 rounded-full" :class="index === items.length - 1 ? (item.status === 'ditolak' ? 'bg-destructive' : 'bg-primary') : 'bg-muted-foreground/40'" />
      </span>
      <div class="min-w-0" :class="item.status === 'ditolak' ? 'rounded-lg border border-destructive/30 bg-bahaya-muda p-3' : ''">
        <div class="flex flex-wrap items-center justify-between gap-2"><DashboardLencanaStatus :status="item.status" /><time :datetime="item.created_at" class="text-xs text-muted-foreground">{{ formatTanggalWaktuWib(item.created_at) }}</time></div>
        <p v-if="item.keterangan" class="mt-2 text-sm leading-6 whitespace-pre-wrap">{{ item.keterangan }}</p>
        <p class="mt-1 text-xs text-muted-foreground">oleh {{ item.status === 'diterima' && !item.nama_pegawai ? 'Sistem' : item.nama_pegawai ?? 'Admin' }}</p>
      </div>
    </li>
  </ol>
</template>
