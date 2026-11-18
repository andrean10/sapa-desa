<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { ArrowLeftRight, Building2, TriangleAlert } from '@lucide/vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'

definePageMeta({ layout: 'dashboard', title: 'Wilayah kerja' })
const kelola = useKelolaKanwil()
const { data, pending, error, refresh } = await useAsyncData('kanwil-wilayah-kerja', () => kelola.daftarWilayah(), { lazy: true })
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
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Wilayah kerja UPT" deskripsi="Tentukan kantor imigrasi yang melayani setiap kabupaten/kota di Riau." />
    <p class="flex items-start gap-2 rounded-lg border border-peringatan/25 bg-peringatan-muda px-4 py-3 text-sm text-peringatan"><TriangleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>Laporan masyarakat yang sudah masuk <strong>tetap di UPT lama</strong>. Penugasan PIMPASA aktif di desa binaan wilayah tersebut akan diakhiri dan perlu ditugaskan ulang dari UPT tujuan.</span></p>
    <DashboardBingkaiTabel>
      <div v-if="pending" class="p-4"><DashboardStateMemuat :baris="8" /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Wilayah kerja belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!data?.kabupaten.length" class="p-4"><DashboardStateKosong judul="Daftar kabupaten/kota belum tersedia." /></div>
      <Table v-else class="min-w-[760px]">
        <TableHeader><TableRow><TableHead>Kabupaten/Kota</TableHead><TableHead>UPT pelayan</TableHead><TableHead class="text-right">Penugasan aktif</TableHead><TableHead class="text-right"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow v-for="item in data.kabupaten" :key="item.id">
            <TableCell><p class="font-medium">{{ item.nama }}</p><p class="text-xs text-muted-foreground capitalize">{{ item.jenis }}</p></TableCell>
            <TableCell><span class="inline-flex items-center gap-1.5"><Building2 class="size-4 text-muted-foreground" aria-hidden="true" />{{ item.kantor }}</span></TableCell>
            <TableCell class="text-right tabular-nums">{{ item.jumlahPenugasanAktif }}</TableCell>
            <TableCell class="text-right"><Button variant="outline" size="sm" @click="mintaUbah(item)"><ArrowLeftRight class="size-3.5" />Ubah UPT</Button></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DashboardBingkaiTabel>
    <AlertDialog v-model:open="dialogKonfirmasi">
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Ubah wilayah kerja {{ terpilih?.nama }}?</AlertDialogTitle><AlertDialogDescription>Laporan masyarakat yang sudah masuk tetap di UPT lama. {{ terpilih?.jumlahPenugasanAktif ?? 0 }} penugasan PIMPASA di desa binaan kabupaten ini akan diakhiri; Kanwil perlu menugaskan petugas baru dari UPT tujuan.</AlertDialogDescription></AlertDialogHeader>
        <label class="grid gap-1.5 text-sm font-medium">UPT tujuan<NativeSelect v-model="kantorTujuan" class="w-full"><NativeSelectOption v-for="kantor in data?.kantor" :key="kantor.id" :value="kantor.id">{{ kantor.nama }}</NativeSelectOption></NativeSelect></label>
        <p v-if="pesan" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesan }}</p>
        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction :disabled="menyimpan || kantorTujuan === terpilih?.kantor_id" @click.prevent="ubah">{{ menyimpan ? 'Menyimpan…' : 'Konfirmasi perubahan' }}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
