<script setup lang="ts">
import { toast } from 'vue-sonner'
import { MapPinCheck, MapPinX, Shield, Building, Landmark, UserX } from '@lucide/vue'
import { Switch } from '~/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', title: 'Status sistem' })
const api = useApi()
const { data, refresh, error, pending } = await useAsyncData('admin-status', () => api<{ validasi_lokasi_aktif: boolean; akun_admin: number; akun_kanwil: number; akun_upt: number; akun_nonaktif: number }>('/api/admin/status'))
const konfirmasi = ref(false)
const proses = ref(false)
async function ubahLokasi(aktif: boolean) {
  proses.value = true
  try { await api('/api/admin/status', { method: 'PATCH', body: { aktif } }); await refresh(); toast.success('Status validasi lokasi diperbarui.') }
  catch (galat) { toast.error(pesanGalat(galat, 'Status lokasi gagal diperbarui.')) }
  finally { proses.value = false; konfirmasi.value = false }
}
// Mematikan validasi selalu lewat konfirmasi; menghidupkan langsung.
function gantiSaklar(aktif: boolean) { if (aktif) void ubahLokasi(true); else konfirmasi.value = true }
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Status sistem" deskripsi="Saklar validasi lokasi dan ringkasan akun SAPA DESA." />
    <div v-if="pending" class="grid gap-4"><Skeleton class="h-36 rounded-xl" /><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" /></div></div>
    <DashboardStateGalat v-else-if="error" pesan="Status sistem belum dapat dimuat." @coba="refresh()" />
    <template v-else-if="data">
      <section class="flex flex-col gap-5 rounded-xl border p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between" :class="data.validasi_lokasi_aktif ? 'border-border/80 bg-card' : 'border-destructive bg-bahaya-muda'">
        <div class="flex gap-4">
          <span class="grid size-12 shrink-0 place-items-center rounded-xl" :class="data.validasi_lokasi_aktif ? 'bg-sukses-muda text-sukses' : 'bg-destructive text-white'" aria-hidden="true"><MapPinCheck v-if="data.validasi_lokasi_aktif" class="size-6" /><MapPinX v-else class="size-6" /></span>
          <div>
            <h2 class="font-semibold">Validasi lokasi Provinsi Riau</h2>
            <p class="mt-1 max-w-2xl text-sm text-muted-foreground">{{ data.validasi_lokasi_aktif ? 'Aktif. Laporan hanya diterima dari dalam wilayah Provinsi Riau.' : 'Mati. Laporan dari luar Riau dapat masuk. Hidupkan kembali setelah pengujian.' }} Izin lokasi di form tetap wajib dan koordinat tetap disimpan.</p>
          </div>
        </div>
        <label for="validasi-lokasi" class="flex shrink-0 items-center gap-3 rounded-lg border bg-card px-4 py-2.5 text-sm font-semibold">
          <span :class="data.validasi_lokasi_aktif ? 'text-sukses' : 'text-destructive'">{{ data.validasi_lokasi_aktif ? 'Aktif' : 'Mati' }}</span>
          <Switch id="validasi-lokasi" :model-value="data.validasi_lokasi_aktif" :disabled="proses" :aria-label="data.validasi_lokasi_aktif ? 'Matikan validasi lokasi' : 'Hidupkan validasi lokasi'" @update:model-value="gantiSaklar" />
        </label>
      </section>
      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Jumlah akun">
        <DashboardKartuAngka label="Admin" :nilai="data.akun_admin" :ikon="Shield" ringkas />
        <DashboardKartuAngka label="Kanwil" :nilai="data.akun_kanwil" :ikon="Landmark" nada="emas" ringkas />
        <DashboardKartuAngka label="UPT" :nilai="data.akun_upt" :ikon="Building" nada="info" ringkas />
        <DashboardKartuAngka label="Akun nonaktif" :nilai="data.akun_nonaktif" :ikon="UserX" nada="peringatan" ke="/admin/akun" keterangan="Kelola akun" ringkas />
      </section>
    </template>
    <AlertDialog :open="konfirmasi" @update:open="konfirmasi = $event"><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Matikan validasi lokasi?</AlertDialogTitle><AlertDialogDescription>Mematikan validasi memungkinkan laporan dari luar Provinsi Riau masuk. Gunakan hanya untuk pengujian. Lanjutkan?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="ubahLokasi(false)">Matikan validasi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
</template>
