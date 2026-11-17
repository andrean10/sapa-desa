<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', title: 'Wilayah kerja' })
const kelola = useKelolaKanwil()
const { data, pending, error, refresh } = await useAsyncData('kanwil-wilayah-kerja', () => kelola.daftarWilayah())
const kantorTujuan = ref('')
const terpilih = ref<{ id: string; nama: string; kantor_id: string; jumlahPenugasanAktif: number }>()
const dialogKonfirmasi = ref(false)
const menyimpan = ref(false)
const pesan = ref('')
function mintaUbah(item: { id: string; nama: string; kantor_id: string; jumlahPenugasanAktif: number }) {
  kantorTujuan.value = item.kantor_id; terpilih.value = item; pesan.value = ''; dialogKonfirmasi.value = true
}
async function ubah() {
  if (!terpilih.value || !kantorTujuan.value) return
  menyimpan.value = true; pesan.value = ''
  try {
    const hasil = await kelola.ubahWilayah(terpilih.value.id, kantorTujuan.value)
    await refresh(); dialogKonfirmasi.value = false
    toast.success(`Wilayah ${terpilih.value.nama} diperbarui. ${hasil.jumlahPenugasanDitutup} penugasan PIMPASA ditutup.`)
  } catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Wilayah kerja belum dapat diubah.' }
  finally { menyimpan.value = false }
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 sm:gap-6">
    <header class="space-y-1 border-l-2 border-accent py-1 pl-4"><p class="text-sm font-semibold text-muted-foreground">Pengaturan wilayah</p><h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Wilayah kerja UPT</h1><p class="text-sm leading-6 text-muted-foreground">Tentukan kantor imigrasi yang melayani tiap kabupaten/kota.</p></header>
    <Alert><AlertTitle>Dampak perubahan wilayah</AlertTitle><AlertDescription>Laporan masyarakat yang sudah masuk tetap di UPT lama. Penugasan PIMPASA aktif di desa binaan pada wilayah tersebut akan diakhiri dan perlu dibuat ulang oleh UPT tujuan.</AlertDescription></Alert>
    <Card><CardHeader><CardTitle>Pemetaan kabupaten/kota</CardTitle><CardDescription>Perubahan hanya dilakukan lewat fungsi database yang menjaga konsistensi penugasan.</CardDescription></CardHeader><CardContent><div v-if="pending" class="grid gap-3"><Skeleton v-for="i in 12" :key="i" class="h-11 w-full" /></div><div v-else-if="error" class="grid gap-3 text-sm text-destructive" role="alert">Wilayah kerja belum dapat dimuat.<Button class="w-fit" variant="outline" @click="refresh()">Coba lagi</Button></div><Table v-else><TableHeader><TableRow><TableHead>Kabupaten/Kota</TableHead><TableHead>Jenis wilayah</TableHead><TableHead>UPT saat ini</TableHead><TableHead>Penugasan aktif terdampak</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data?.kabupaten ?? []" :key="item.id"><TableCell class="font-medium">{{ item.nama }}</TableCell><TableCell class="capitalize">{{ item.jenis }}</TableCell><TableCell>{{ item.kantor }}</TableCell><TableCell>{{ item.jumlahPenugasanAktif }}</TableCell><TableCell><Button variant="outline" size="sm" @click="mintaUbah(item)">Ubah UPT</Button></TableCell></TableRow><TableEmpty v-if="!data?.kabupaten.length" :colspan="5">Daftar kabupaten/kota belum tersedia.</TableEmpty></TableBody></Table></CardContent></Card>
    <AlertDialog v-model:open="dialogKonfirmasi"><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Ubah wilayah kerja?</AlertDialogTitle><AlertDialogDescription><strong>{{ terpilih?.nama }}</strong> akan dialihkan ke kantor tujuan. Laporan masyarakat lama tetap di UPT sebelumnya. {{ terpilih?.jumlahPenugasanAktif ?? 0 }} penugasan PIMPASA aktif akan ditutup; Kanwil perlu menugaskan pegawai UPT tujuan.</AlertDialogDescription></AlertDialogHeader><label class="grid gap-2 text-sm font-medium">UPT tujuan<NativeSelect v-model="kantorTujuan"><NativeSelectOption v-for="kantor in data?.kantor" :key="kantor.id" :value="kantor.id">{{ kantor.nama }}</NativeSelectOption></NativeSelect></label><p v-if="pesan" class="text-sm text-destructive" role="alert">{{ pesan }}</p><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction :disabled="menyimpan || kantorTujuan === terpilih?.kantor_id" @click.prevent="ubah">{{ menyimpan ? 'Menyimpan…' : 'Konfirmasi perubahan' }}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
</template>
