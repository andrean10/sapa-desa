<script setup lang="ts">
import { Copy, ExternalLink, FileText, ImageIcon, Link2, MapPin, ShieldAlert, UserRound } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import type { Enums } from '~~/shared/types/database.types'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'

// Kolom kiri detail laporan (PRD 7.3/8.4). Nama & alamat pelapor hanya tampil di halaman detail ini.
export type IsiLaporanData = {
  kode_pelacakan: string
  status: Enums<'status_laporan'>
  jenis_terlapor: Enums<'jenis_terlapor'>
  created_at: string
  nama_pelapor: string | null
  alamat_pelapor: string | null
  isi_laporan: string
  lintang: number
  bujur: number
  foto_url: string | null
  kantor: string | null
  lokasi: { desa: string | null; kecamatan: string | null; kabupaten: string | null }
  laporan_sebelumnya_id: string | null
  laporan_sebelumnya: { id: string; kode_pelacakan: string } | null
}
const properti = defineProps<{ data: IsiLaporanData; basisTautan: string; tampilkanDibaca?: boolean; dibacaPada?: string | null }>()
const fotoTerbuka = ref(false)
const lokasi = computed(() => [properti.data.lokasi.desa, properti.data.lokasi.kecamatan, properti.data.lokasi.kabupaten].filter(Boolean).join(', ') || 'Lokasi tidak tersedia')

async function salinKode() {
  try { await navigator.clipboard.writeText(properti.data.kode_pelacakan); toast.success('Kode laporan disalin.') }
  catch { toast.error('Kode belum dapat disalin. Silakan salin secara manual.') }
}
</script>

<template>
  <article class="min-w-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
    <header class="flex flex-col gap-4 border-b bg-linear-to-br from-primary/[0.05] to-transparent p-5 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="font-mono text-xl font-semibold tracking-wide text-primary">{{ data.kode_pelacakan }}</h1>
          <Button variant="ghost" size="icon-sm" aria-label="Salin kode laporan" @click="salinKode"><Copy class="size-4" /></Button>
        </div>
        <p class="text-sm text-muted-foreground">Masuk {{ formatTanggalWaktuWib(data.created_at) }}<template v-if="data.kantor"> · {{ data.kantor }}</template></p>
        <p v-if="tampilkanDibaca"><DashboardLencanaDibaca :dibaca-pada="dibacaPada" /></p>
      </div>
      <div class="flex items-center gap-2"><DashboardLencanaJenis :jenis="data.jenis_terlapor" /><DashboardLencanaStatus :status="data.status" /></div>
    </header>

    <div class="grid gap-6 p-5">
      <section class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border bg-muted/25 p-4">
          <h2 class="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><UserRound class="size-3.5" aria-hidden="true" />Pelapor</h2>
          <p class="mt-2 font-medium">{{ data.nama_pelapor || 'Tidak dicantumkan' }}</p>
          <p class="mt-0.5 text-sm text-muted-foreground">{{ data.alamat_pelapor }}</p>
          <p class="mt-3 flex items-center gap-1.5 text-xs text-peringatan"><ShieldAlert class="size-3.5 shrink-0" aria-hidden="true" />Data pribadi, jangan disebarluaskan.</p>
        </div>
        <div class="rounded-lg border bg-muted/25 p-4">
          <h2 class="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><MapPin class="size-3.5" aria-hidden="true" />Lokasi kejadian</h2>
          <p class="mt-2 font-medium">{{ lokasi }}</p>
          <p class="mt-0.5 font-mono text-xs text-muted-foreground">{{ data.lintang }}, {{ data.bujur }}</p>
          <a class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline" :href="`https://www.google.com/maps?q=${data.lintang},${data.bujur}`" target="_blank" rel="noopener noreferrer">Buka lokasi pelapor di peta<ExternalLink class="size-3.5" aria-hidden="true" /></a>
        </div>
      </section>

      <section>
        <h2 class="flex items-center gap-2 text-sm font-semibold"><FileText class="size-4 text-muted-foreground" aria-hidden="true" />Isi laporan</h2>
        <p class="mt-2 rounded-lg border-l-4 border-primary/25 bg-muted/25 p-4 leading-7 whitespace-pre-wrap">{{ data.isi_laporan }}</p>
      </section>

      <section v-if="data.foto_url">
        <h2 class="flex items-center gap-2 text-sm font-semibold"><ImageIcon class="size-4 text-muted-foreground" aria-hidden="true" />Foto pendukung</h2>
        <button type="button" class="mt-2 block overflow-hidden rounded-lg border transition hover:ring-3 hover:ring-ring/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" aria-label="Perbesar foto pendukung" @click="fotoTerbuka = true">
          <img :src="data.foto_url" alt="Foto pendukung laporan" class="max-h-56 object-cover" loading="lazy">
        </button>
        <Dialog v-model:open="fotoTerbuka">
          <DialogContent class="sm:max-w-4xl">
            <DialogHeader><DialogTitle>Foto pendukung</DialogTitle><DialogDescription>{{ data.kode_pelacakan }}</DialogDescription></DialogHeader>
            <img :src="data.foto_url" alt="Foto pendukung laporan" class="max-h-[75svh] w-full rounded-lg object-contain">
          </DialogContent>
        </Dialog>
      </section>

      <section v-if="data.laporan_sebelumnya_id" class="flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-4 text-sm">
        <Link2 class="size-4 text-muted-foreground" aria-hidden="true" /><span class="text-muted-foreground">Tindak lanjut dari laporan</span>
        <NuxtLink v-if="data.laporan_sebelumnya" class="font-mono font-semibold text-primary" :to="`${basisTautan}/${data.laporan_sebelumnya.id}`">{{ data.laporan_sebelumnya.kode_pelacakan }}</NuxtLink>
        <span v-else class="text-muted-foreground">(laporan sebelumnya tidak dapat dibaca oleh akun ini)</span>
      </section>
    </div>
  </article>
</template>
