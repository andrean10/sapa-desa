<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { Info, MapPinned, MapPinOff, Plus, Search } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { formatTanggalWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Desa binaan' })
const kelola = useKelolaKanwil()
const { data, pending, error, refresh } = await useAsyncData('kanwil-desa-binaan', () => kelola.daftarDesa(), { lazy: true })
const bukaTambah = ref(false)
const menyimpan = ref(false)
const pesan = ref('')
const kabupatenId = ref('')
const kecamatanId = ref('')
const desaId = ref('')
const pilihan = ref<{ kabupaten: { id: string; nama: string; jenis: string }[]; kecamatan: { id: string; nama: string }[]; desa: { id: string; nama: string; dbi: boolean }[] }>({ kabupaten: [], kecamatan: [], desa: [] })
const cari = ref('')
const terlihat = computed(() => {
  const kunci = cari.value.trim().toLocaleLowerCase('id')
  return (data.value ?? []).filter(item => !kunci || [item.nama, item.kecamatan, item.kabupaten, item.kantor].some(teks => teks?.toLocaleLowerCase('id').includes(kunci)))
})
const tersedia = computed(() => pilihan.value.desa.filter(item => !item.dbi))
async function bukaFormTambah() {
  pesan.value = ''; kabupatenId.value = ''; kecamatanId.value = ''; desaId.value = ''
  bukaTambah.value = true
  try { pilihan.value = { ...pilihan.value, ...(await kelola.pilihanWilayah({})) } }
  catch { pesan.value = 'Daftar kabupaten/kota belum dapat dimuat.' }
}
watch(kabupatenId, async (nilai) => {
  kecamatanId.value = ''; desaId.value = ''; pilihan.value.kecamatan = []; pilihan.value.desa = []
  if (!nilai) return
  try { pilihan.value.kecamatan = (await kelola.pilihanWilayah({ kabupatenId: nilai })).kecamatan }
  catch { pesan.value = 'Daftar kecamatan belum dapat dimuat.' }
})
watch(kecamatanId, async (nilai) => {
  desaId.value = ''; pilihan.value.desa = []
  if (!nilai) return
  try { pilihan.value.desa = (await kelola.pilihanWilayah({ kabupatenId: kabupatenId.value, kecamatanId: nilai })).desa }
  catch { pesan.value = 'Daftar desa belum dapat dimuat.' }
})
async function tetapkan() {
  if (!desaId.value) return
  menyimpan.value = true; pesan.value = ''
  try { await kelola.ubahDbi(desaId.value, true); await refresh(); bukaTambah.value = false; toast.success('Status Desa Binaan berhasil ditetapkan.') }
  catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Status DBI belum dapat ditetapkan.' }
  finally { menyimpan.value = false }
}
async function cabut(item: { id: string; nama: string }) {
  try { const hasil = await kelola.ubahDbi(item.id, false); await refresh(); toast.success(`Status DBI dicabut. ${hasil.jumlahPenugasanDitutup ?? 0} penugasan ikut ditutup.`) }
  catch (galat) { toast.error((galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? `Status DBI untuk ${item.nama} belum dapat dicabut.`) }
}
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Desa Binaan Imigrasi" deskripsi="Desa yang ditetapkan sebagai DBI beserta PIMPASA aktif dan kegiatan terakhirnya.">
      <template #aksi><Button @click="bukaFormTambah"><Plus class="size-4" />Tetapkan desa binaan</Button></template>
    </DashboardKepalaHalaman>
    <p class="flex items-start gap-2 rounded-lg border border-info/20 bg-info-muda/60 px-4 py-3 text-sm text-info"><Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />Perubahan DBI langsung berlaku. Penugasan PIMPASA aktif ikut diakhiri saat status DBI dicabut.</p>

    <DashboardBingkaiTabel>
      <template #toolbar>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="relative w-full sm:w-72"><Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><label for="cari-desa" class="sr-only">Cari desa</label><Input id="cari-desa" v-model="cari" type="search" placeholder="Cari desa, kecamatan, atau UPT…" class="h-9 bg-card pl-9" /></div>
          <p class="text-sm text-muted-foreground"><strong class="font-semibold text-foreground tabular-nums">{{ data?.length ?? 0 }}</strong> desa binaan</p>
        </div>
      </template>
      <div v-if="pending" class="p-4"><DashboardStateMemuat /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Daftar desa binaan belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!terlihat.length" class="p-4"><DashboardStateKosong :judul="cari ? 'Tidak ada desa yang cocok.' : 'Belum ada desa binaan.'" :ikon="MapPinned"><Button v-if="!cari" @click="bukaFormTambah"><Plus class="size-4" />Tetapkan desa binaan</Button></DashboardStateKosong></div>
      <Table v-else class="min-w-[900px]">
        <TableHeader><TableRow><TableHead>Desa/Kelurahan</TableHead><TableHead>UPT</TableHead><TableHead>PIMPASA aktif</TableHead><TableHead>Kegiatan terakhir</TableHead><TableHead class="text-right"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow v-for="item in terlihat" :key="item.id">
            <TableCell><p class="font-medium">{{ item.nama }}</p><p class="text-xs text-muted-foreground">Kec. {{ item.kecamatan }} · {{ item.kabupaten }}</p></TableCell>
            <TableCell>{{ item.kantor }}</TableCell>
            <TableCell><div v-if="item.petugas.length" class="flex flex-wrap gap-1"><span v-for="nama in item.petugas" :key="nama" class="rounded-md bg-primary/6 px-2 py-0.5 text-xs font-medium text-primary">{{ nama }}</span></div><span v-else class="rounded-full bg-peringatan-muda px-2 py-0.5 text-xs font-semibold text-peringatan">Belum ada</span></TableCell>
            <TableCell :class="item.kegiatanTerakhir ? '' : 'text-muted-foreground'">{{ item.kegiatanTerakhir ? formatTanggalWib(item.kegiatanTerakhir) : 'Belum ada' }}</TableCell>
            <TableCell class="text-right">
              <AlertDialog>
                <AlertDialogTrigger as-child><Button variant="ghost" size="sm" class="text-destructive hover:bg-bahaya-muda hover:text-destructive"><MapPinOff class="size-3.5" />Cabut DBI</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cabut status DBI {{ item.nama }}?</AlertDialogTitle><AlertDialogDescription>{{ item.penugasanAktif }} penugasan PIMPASA akan diakhiri dengan alasan desa dicabut.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="cabut(item)">Cabut status DBI</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DashboardBingkaiTabel>

    <Dialog v-model:open="bukaTambah">
      <DialogContent>
        <DialogHeader><DialogTitle>Tetapkan Desa Binaan Imigrasi</DialogTitle><DialogDescription>Pilih kabupaten, kecamatan, lalu desa yang belum berstatus DBI.</DialogDescription></DialogHeader>
        <div class="grid gap-4">
          <label class="grid gap-1.5 text-sm font-medium">1. Kabupaten/Kota<NativeSelect v-model="kabupatenId" class="w-full"><NativeSelectOption value="">Pilih kabupaten/kota</NativeSelectOption><NativeSelectOption v-for="item in pilihan.kabupaten" :key="item.id" :value="item.id">{{ item.jenis }} {{ item.nama }}</NativeSelectOption></NativeSelect></label>
          <label class="grid gap-1.5 text-sm font-medium">2. Kecamatan<NativeSelect v-model="kecamatanId" class="w-full" :disabled="!kabupatenId"><NativeSelectOption value="">Pilih kecamatan</NativeSelectOption><NativeSelectOption v-for="item in pilihan.kecamatan" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect></label>
          <label class="grid gap-1.5 text-sm font-medium">3. Desa/Kelurahan<NativeSelect v-model="desaId" class="w-full" :disabled="!kecamatanId"><NativeSelectOption value="">Pilih desa yang belum DBI</NativeSelectOption><NativeSelectOption v-for="item in tersedia" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect><span v-if="kecamatanId && !tersedia.length" class="text-xs font-normal text-muted-foreground">Semua desa di kecamatan ini sudah berstatus DBI.</span></label>
          <p v-if="pesan" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesan }}</p>
        </div>
        <DialogFooter><Button variant="outline" @click="bukaTambah = false">Batal</Button><Button :disabled="!desaId || menyimpan" @click="tetapkan">{{ menyimpan ? 'Menyimpan…' : 'Tetapkan DBI' }}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
