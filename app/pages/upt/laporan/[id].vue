<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Skeleton } from '~/components/ui/skeleton'
import type { Enums } from '~~/shared/types/database.types'

definePageMeta({ layout: 'dashboard', title: 'Detail Laporan' })
const route = useRoute()
const { detail, ubahStatus } = useLaporanUpt()
const { daftarPegawai, pegawaiBertugasId } = useAuth()
const { data, pending, error, refresh } = await useAsyncData(`upt-laporan-${route.params.id}`, () => detail(String(route.params.id)))
const menyimpan = ref(false)
const pesan = ref('')
const namaPetugas = ref('')
const riwayat = computed(() => (data.value?.riwayat_status ?? []).map(item => ({ id: item.id, status: item.status, keterangan: item.keterangan, created_at: item.created_at, nama_pegawai: item.nama_pegawai })))
onMounted(async () => {
  if (!pegawaiBertugasId.value) return
  const daftar = await daftarPegawai().catch(() => [])
  namaPetugas.value = daftar.find(item => item.id === pegawaiBertugasId.value)?.nama ?? ''
})

async function simpanStatus(status: Enums<'status_laporan'>, keterangan: string) {
  if (menyimpan.value) return
  menyimpan.value = true; pesan.value = ''
  try { await ubahStatus(String(route.params.id), status, keterangan); await refresh(); toast.success('Status diperbarui') }
  catch (galat) { pesan.value = pesanGalat(galat, 'Status belum dapat diperbarui.'); if (pesan.value.includes('Muat ulang')) await refresh() }
  finally { menyimpan.value = false }
}
</script>

<template>
  <div class="grid gap-5">
    <NuxtLink to="/upt/laporan" class="w-fit text-sm font-medium text-muted-foreground no-underline hover:text-primary">← Laporan masyarakat</NuxtLink>
    <div v-if="pending" class="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]"><Skeleton class="h-[28rem] rounded-xl" /><Skeleton class="h-80 rounded-xl" /></div>
    <DashboardStateGalat v-else-if="error" pesan="Laporan tidak ditemukan atau belum dapat dimuat." deskripsi="Laporan mungkin sudah dihapus atau bukan milik kantor Anda." @coba="refresh()" />
    <div v-else-if="data" class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
      <DashboardIsiLaporan :data="data" basis-tautan="/upt/laporan" />
      <div class="grid gap-5 xl:sticky xl:top-20">
        <DashboardPanelUbahStatus :status-kini="data.status" :menyimpan="menyimpan" :pesan="pesan" :nama-petugas="namaPetugas" @simpan="simpanStatus" />
        <section class="rounded-xl border border-border/80 bg-card shadow-xs">
          <header class="border-b px-5 py-4"><h2 class="font-semibold">Riwayat status</h2><p class="text-sm text-muted-foreground">Keterangan tampil juga kepada pelapor; nama petugas tidak.</p></header>
          <div class="p-5"><DashboardTimelineInternal :items="riwayat" /></div>
        </section>
      </div>
    </div>
  </div>
</template>
