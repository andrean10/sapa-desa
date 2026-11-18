<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Eye } from '@lucide/vue'
import { Skeleton } from '~/components/ui/skeleton'
import type { Enums, Tables } from '~~/shared/types/database.types'

definePageMeta({ layout: 'dashboard', title: 'Detail laporan masyarakat' })
const route = useRoute()
type DetailLaporan = Omit<Tables<'laporan'>, 'foto_path'> & {
  foto_url: string | null
  kantor: string | null
  lokasi: { desa: string | null; kecamatan: string | null; kabupaten: string | null }
  laporan_sebelumnya: { id: string; kode_pelacakan: string } | null
  dibaca_pada: string | null
  riwayat_status: { id: string; status: Enums<'status_laporan'>; keterangan: string | null; created_at: string; nama_pegawai: string | null; diproses_oleh: string | null }[]
}
const api = useApi()
const { data, pending, error, refresh } = await useAsyncData<DetailLaporan>(`kanwil-laporan-${route.params.id}`, () => api<DetailLaporan>(`/api/kanwil/laporan/${route.params.id}`), { lazy: true })
const { profil } = useAuth()
const sedangSimpan = ref(false)
const pesan = ref('')

// Hanya admin yang boleh mengubah status (database mengizinkan; p_pegawai_id kosong). Kanwil baca saja.
async function simpanStatus(status: Enums<'status_laporan'>, keterangan: string) {
  if (sedangSimpan.value) return
  sedangSimpan.value = true; pesan.value = ''
  try {
    await api<{ berhasil: true }>(`/api/kanwil/laporan/${route.params.id}/status`, { method: 'POST', body: { status, keterangan: keterangan || undefined } })
    await refresh()
    toast.success('Status diperbarui.')
  } catch (galat) {
    pesan.value = pesanGalat(galat, 'Status laporan belum dapat diubah.')
    if (pesan.value.includes('Muat ulang')) await refresh()
  } finally { sedangSimpan.value = false }
}
</script>

<template>
  <div class="grid gap-5">
    <NuxtLink to="/kanwil/laporan" class="w-fit text-sm font-medium text-muted-foreground no-underline hover:text-primary">← Laporan masyarakat</NuxtLink>
    <div v-if="pending" class="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]"><Skeleton class="h-[28rem] rounded-xl" /><Skeleton class="h-80 rounded-xl" /></div>
    <DashboardStateGalat v-else-if="error" pesan="Detail belum dapat dimuat." deskripsi="Periksa koneksi atau akses laporan." @coba="refresh()" />
    <div v-else-if="data" class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
      <DashboardIsiLaporan :data="data" basis-tautan="/kanwil/laporan" tampilkan-dibaca :dibaca-pada="data.dibaca_pada" />
      <div class="grid gap-5 xl:sticky xl:top-20">
        <DashboardPanelUbahStatus v-if="profil?.peran === 'admin'" :status-kini="data.status" :menyimpan="sedangSimpan" :pesan="pesan" mode-admin @simpan="simpanStatus" />
        <p v-else class="flex items-center gap-2 rounded-xl border bg-info-muda/60 px-4 py-3 text-sm text-info"><Eye class="size-4 shrink-0" aria-hidden="true" />Kanwil hanya dapat membaca laporan. Status ditangani oleh UPT.</p>
        <section class="rounded-xl border border-border/80 bg-card shadow-xs">
          <header class="border-b px-5 py-4"><h2 class="font-semibold">Riwayat status</h2><p class="text-sm text-muted-foreground">Keterangan juga tampil kepada pelapor.</p></header>
          <div class="p-5"><DashboardTimelineInternal :items="data.riwayat_status" /></div>
        </section>
      </div>
    </div>
  </div>
</template>
