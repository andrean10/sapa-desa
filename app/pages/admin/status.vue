<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
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
  catch (e) { toast.error(e instanceof Error ? e.message : 'Status lokasi gagal diperbarui.') }
  finally { proses.value = false; konfirmasi.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <div><h1 class="text-2xl font-semibold">Status sistem</h1><p class="text-muted-foreground">Pantau kondisi penting dan jumlah akun SAPA DESA.</p></div>
    <div v-if="pending" class="grid gap-4 sm:grid-cols-2"><Skeleton v-for="i in 5" :key="i" class="h-28 w-full" /></div>
    <p v-if="error" role="alert" class="text-destructive">Status sistem belum dapat dimuat. <Button variant="outline" @click="refresh()">Coba lagi</Button></p>
    <Card v-if="data && !pending" :class="!data.validasi_lokasi_aktif ? 'border-destructive bg-destructive/5' : ''">
      <CardHeader><CardTitle>Validasi lokasi</CardTitle><CardDescription>{{ data.validasi_lokasi_aktif ? 'Laporan dibatasi ke wilayah Provinsi Riau.' : 'Validasi mati; laporan dari luar Riau dapat masuk.' }}</CardDescription></CardHeader>
      <CardContent class="flex items-center justify-between"><label for="validasi-lokasi" class="text-sm font-medium">{{ data.validasi_lokasi_aktif ? 'Aktif' : 'Nonaktif' }}</label><Switch id="validasi-lokasi" :checked="data.validasi_lokasi_aktif" :disabled="proses" :aria-label="data.validasi_lokasi_aktif ? 'Matikan validasi lokasi' : 'Hidupkan validasi lokasi'" @update:checked="(aktif:boolean) => aktif ? ubahLokasi(true) : (konfirmasi = true)" /></CardContent>
    </Card>
    <div v-if="!pending && data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="item in [{label:'Admin', value:data.akun_admin},{label:'Kanwil',value:data.akun_kanwil},{label:'UPT',value:data.akun_upt},{label:'Akun nonaktif',value:data.akun_nonaktif}]" :key="item.label"><CardHeader><CardDescription>{{ item.label }}</CardDescription><CardTitle>{{ item.value }}</CardTitle></CardHeader></Card>
    </div>
    <AlertDialog :open="konfirmasi" @update:open="konfirmasi = $event"><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Matikan validasi lokasi?</AlertDialogTitle><AlertDialogDescription>Mematikan validasi memungkinkan laporan dari luar Provinsi Riau masuk. Gunakan hanya untuk pengujian. Lanjutkan?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction @click="ubahLokasi(false)">Matikan validasi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
</template>
