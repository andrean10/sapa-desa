<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ExternalLink, Copy } from '@lucide/vue'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'
import { STATUS_LAPORAN } from '~~/shared/config/teks'
import type { Enums, Tables } from '~~/shared/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Textarea } from '~/components/ui/textarea'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', title: 'Detail laporan masyarakat' })
const route = useRoute()
type DetailLaporan = Omit<Tables<'laporan'>, 'foto_path'> & {
  foto_url: string | null
  kantor: string | null
  lokasi: { desa: string | null; kecamatan: string | null; kabupaten: string | null }
  laporan_sebelumnya: { id: string; kode_pelacakan: string } | null
  riwayat_status: { id: string; status: Enums<'status_laporan'>; keterangan: string | null; created_at: string; nama_pegawai: string | null }[]
}
const api = useApi()
const { data, pending, error, refresh } = await useAsyncData<DetailLaporan>(`kanwil-laporan-${route.params.id}`, () => api<DetailLaporan>(`/api/kanwil/laporan/${route.params.id}`))
const { profil } = useAuth()
const alur: Record<Enums<'status_laporan'>, Enums<'status_laporan'>[]> = { diterima: ['diverifikasi', 'ditolak'], diverifikasi: ['ditindaklanjuti', 'ditolak'], ditindaklanjuti: ['selesai'], selesai: [], ditolak: [] }
const statusBaru = ref<Enums<'status_laporan'> | ''>('')
const keterangan = ref('')
const dialogKonfirmasi = ref(false)
const sedangSimpan = ref(false)
const pesan = ref('')
watch(() => data.value?.status, status => { statusBaru.value = status ? alur[status][0] ?? '' : '' }, { immediate: true })
async function salinKode() {
  if (!data.value) return
  try { await navigator.clipboard.writeText(data.value.kode_pelacakan); toast.success('Kode pelacakan disalin.') }
  catch { toast.error('Kode belum dapat disalin.') }
}
async function simpanStatus() {
  if (!data.value || !statusBaru.value) return
  if (['ditolak', 'selesai'].includes(statusBaru.value) && !keterangan.value.trim()) { pesan.value = 'Keterangan wajib untuk status ini.'; return }
  sedangSimpan.value = true
  pesan.value = ''
  try {
    await api<{ berhasil: true }>(`/api/kanwil/laporan/${route.params.id}/status`, { method: 'POST', body: { status: statusBaru.value, keterangan: keterangan.value.trim() || undefined } })
    await refresh()
    keterangan.value = ''
    dialogKonfirmasi.value = false
    toast.success('Status diperbarui.')
  } catch (galat) {
    pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Status laporan belum dapat diubah.'
    if (pesan.value.includes('Muat ulang')) await refresh()
  } finally { sedangSimpan.value = false }
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 sm:gap-6">
    <header class="space-y-1 border-l-2 border-accent py-1 pl-4">
      <Button as-child variant="ghost" class="-ml-3"><NuxtLink to="/kanwil/laporan">← Kembali ke daftar</NuxtLink></Button>
      <p class="text-sm font-semibold text-muted-foreground">Pelayanan masyarakat</p><h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Detail laporan</h1>
    </header>
    <div v-if="pending" class="grid gap-3 lg:grid-cols-2"><Skeleton class="h-96 w-full" /><Skeleton class="h-96 w-full" /></div>
    <Card v-else-if="error" role="alert">
      <CardHeader><CardTitle>Detail belum dapat dimuat</CardTitle><CardDescription>Periksa koneksi atau akses laporan.</CardDescription></CardHeader>
      <CardContent><Button variant="outline" @click="refresh()">Coba lagi</Button></CardContent>
    </Card>
    <template v-else-if="data">
      <div class="grid items-start gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div><CardTitle class="font-mono">{{ data.kode_pelacakan }}</CardTitle><CardDescription class="mt-1">{{ data.kantor }} · {{ formatTanggalWaktuWib(data.created_at) }}</CardDescription></div>
              <div class="flex items-center gap-2"><StatusBadge :status="data.status" /><Button variant="outline" size="icon" aria-label="Salin kode pelacakan" @click="salinKode"><Copy class="size-4" /></Button></div>
            </div>
          </CardHeader>
          <CardContent class="grid gap-5">
            <section class="grid gap-4 rounded-lg border p-4 sm:grid-cols-2"><div><p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pelapor</p><p class="mt-1 font-medium">{{ data.nama_pelapor || 'Tidak dicantumkan' }}</p><p class="text-sm text-muted-foreground">{{ data.alamat_pelapor }}</p></div><div><p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lokasi kejadian</p><p class="mt-1 font-medium">{{ data.lokasi.desa }}, {{ data.lokasi.kecamatan }}, {{ data.lokasi.kabupaten }}</p><a class="mt-1 inline-flex items-center gap-1 text-sm underline" :href="`https://www.google.com/maps?q=${data.lintang},${data.bujur}`" target="_blank" rel="noopener noreferrer">Buka lokasi di peta<ExternalLink class="size-3.5" /></a></div></section>
            <div><p class="text-sm text-muted-foreground">Yang dilaporkan</p><p class="font-medium">{{ data.jenis_terlapor.toUpperCase() }}</p></div>
            <div><p class="text-sm text-muted-foreground">Isi laporan</p><p class="mt-1 whitespace-pre-wrap leading-7">{{ data.isi_laporan }}</p></div>
            <a v-if="data.foto_url" :href="data.foto_url" target="_blank" rel="noopener noreferrer" class="block w-fit"><img :src="data.foto_url" alt="Foto pendukung laporan" class="max-h-80 rounded-lg border object-contain" loading="lazy"></a>
            <div v-if="data.laporan_sebelumnya" class="rounded-lg border p-4"><p class="text-sm text-muted-foreground">Tindak lanjut laporan sebelumnya</p><NuxtLink class="mt-1 inline-block font-mono font-semibold underline" :to="`/kanwil/laporan/${data.laporan_sebelumnya.id}`">{{ data.laporan_sebelumnya.kode_pelacakan }}</NuxtLink></div>
          </CardContent>
        </Card>

        <div class="grid gap-5">
          <Card v-if="profil?.peran === 'admin'">
            <CardHeader><CardTitle>Ubah status</CardTitle><CardDescription>Keterangan dapat dilihat oleh pelapor. Perubahan dicatat atas nama Admin.</CardDescription></CardHeader>
            <CardContent v-if="alur[data.status].length" class="grid gap-4">
              <label class="grid gap-2 text-sm font-medium">Status berikutnya<NativeSelect v-model="statusBaru"><NativeSelectOption v-for="item in alur[data.status]" :key="item" :value="item">{{ STATUS_LAPORAN.find(status => status.value === item)?.label }}</NativeSelectOption></NativeSelect></label>
              <label class="grid gap-2 text-sm font-medium">Keterangan (dapat dilihat oleh pelapor) · {{ keterangan.length }}/1000<Textarea v-model="keterangan" maxlength="1000" rows="4" placeholder="Jangan menuliskan identitas atau data sensitif." /></label>
              <p v-if="pesan" class="text-sm text-destructive" role="alert">{{ pesan }}</p>
              <Button class="w-fit" :disabled="!statusBaru || sedangSimpan" @click="['ditolak', 'selesai'].includes(statusBaru) ? dialogKonfirmasi = true : simpanStatus()">{{ sedangSimpan ? 'Menyimpan…' : 'Simpan status' }}</Button>
            </CardContent>
            <CardContent v-else><p class="text-sm text-muted-foreground">Laporan sudah final dan tidak dapat diubah.</p></CardContent>
          </Card>
          <AlertDialog v-model:open="dialogKonfirmasi"><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi status {{ STATUS_LAPORAN.find(item => item.value === statusBaru)?.label }}?</AlertDialogTitle><AlertDialogDescription>Status ini final dan tidak dapat diubah lagi. Keterangan dapat dibaca pelapor.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction :disabled="sedangSimpan" @click.prevent="simpanStatus">Konfirmasi dan simpan</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
          <Card>
            <CardHeader><CardTitle>Riwayat status</CardTitle><CardDescription>Catatan yang tampil kepada pelapor.</CardDescription></CardHeader>
            <CardContent><ol class="grid gap-4"><li v-for="item in data.riwayat_status" :key="item.id" class="rounded-r-lg border-l-2 pl-4" :class="item.status === 'ditolak' ? 'border-destructive bg-destructive/10 p-3' : 'border-primary py-1'"><div class="flex flex-wrap justify-between gap-2"><StatusBadge :status="item.status" /><time class="text-sm text-muted-foreground">{{ formatTanggalWaktuWib(item.created_at) }}</time></div><p v-if="item.keterangan" class="mt-2 whitespace-pre-wrap text-sm">{{ item.keterangan }}</p><p class="mt-1 text-xs text-muted-foreground">Oleh {{ item.status === 'diterima' ? 'Sistem' : item.nama_pegawai ?? 'Admin' }}</p></li></ol></CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
