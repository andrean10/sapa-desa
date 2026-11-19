<script setup lang="ts">
import { CalendarDays, ClipboardList, FileSearch, FileText, Image, MapPinned, Paperclip, Pencil, Plus, RotateCw, Trash2, Users, X } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { formatTanggalWib, tanggalHariIniWib } from '~~/shared/utils/waktu'
import KegiatanForm from '~/components/upt/KegiatanForm.vue'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'

definePageMeta({ layout: 'dashboard', title: 'Laporan Kegiatan' })

const route = useRoute()
const router = useRouter()
const { daftar, hapus } = useKegiatanUpt()
const { data, pending, error, refresh } = await daftar()
const pesan = ref('')
const bulan = ref(tanggalHariIniWib().slice(0, 7))
const desaDipilih = ref('')
const jenisDipilih = ref('')
const pegawaiDipilih = ref('')
const sekarang = ref(Date.now())
const formTerbuka = ref(false)
const kegiatanDiubahId = ref('')
const desaAwal = ref('')
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => { sekarang.value = Date.now() }, 30_000)
  bukaDariQuery()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(() => route.query, bukaDariQuery)
watch(formTerbuka, (terbuka) => {
  if (!terbuka && (route.query.buat || route.query.edit || route.query.desa)) void hapusQueryForm()
})

const kegiatan = computed(() => data.value?.data ?? [])
const desaPilihan = computed(() => [...new Map(kegiatan.value.map(item => [item.desa_id, item.desa])).entries()])
const jenisPilihan = computed(() => [...new Map(kegiatan.value.map(item => [item.jenis_kegiatan_id, item.jenis])).entries()])
const pegawaiPilihan = computed(() => [...new Map(kegiatan.value.map(item => [item.pegawai_id, item.pegawai])).entries()])
const terlihat = computed(() => kegiatan.value.filter(item =>
  (!bulan.value || item.tanggal_kegiatan.startsWith(bulan.value)) &&
  (!desaDipilih.value || item.desa_id === desaDipilih.value) &&
  (!jenisDipilih.value || item.jenis_kegiatan_id === jenisDipilih.value) &&
  (!pegawaiDipilih.value || item.pegawai_id === pegawaiDipilih.value)
))
const totalLampiran = computed(() => terlihat.value.filter(item => item.foto_path || item.pdf_path).length)
const totalPeserta = computed(() => terlihat.value.reduce((jumlah, item) => jumlah + item.jumlah_peserta, 0))
const adaFilter = computed(() => Boolean(desaDipilih.value || jenisDipilih.value || pegawaiDipilih.value || bulan.value !== tanggalHariIniWib().slice(0, 7)))
function resetFilter() { bulan.value = tanggalHariIniWib().slice(0, 7); desaDipilih.value = ''; jenisDipilih.value = ''; pegawaiDipilih.value = '' }

function bukaDariQuery() {
  const edit = typeof route.query.edit === 'string' ? route.query.edit : ''
  const buat = route.query.buat === '1'
  if (!edit && !buat) return
  kegiatanDiubahId.value = edit
  desaAwal.value = typeof route.query.desa === 'string' ? route.query.desa : ''
  formTerbuka.value = true
}

function bukaForm(desaId = '') {
  kegiatanDiubahId.value = ''
  desaAwal.value = desaId
  formTerbuka.value = true
}

function bukaUbah(id: string) {
  kegiatanDiubahId.value = id
  desaAwal.value = ''
  formTerbuka.value = true
}

async function hapusQueryForm() {
  const { buat: _buat, edit: _edit, desa: _desa, ...query } = route.query
  await router.replace({ query })
}

async function selesaiSimpan() {
  formTerbuka.value = false
  await refresh()
}

function sisaMenit(item: { created_at: string }) {
  return Math.max(0, Math.ceil((new Date(item.created_at).getTime() + (data.value?.batas_menit_hapus ?? 10) * 60_000 - sekarang.value) / 60_000))
}

async function konfirmasiHapus(id: string) {
  pesan.value = ''
  try {
    await hapus(id)
    await refresh()
    toast.success('Laporan kegiatan dihapus.')
  } catch (galat) {
    pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Laporan kegiatan belum dapat dihapus.'
  }
}
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Laporan kegiatan" deskripsi="Catat kegiatan PIMPASA di desa binaan beserta dokumentasinya.">
      <template #aksi><Button @click="bukaForm()"><Plus class="size-4" />Buat laporan kegiatan</Button></template>
    </DashboardKepalaHalaman>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan kegiatan">
      <DashboardKartuAngka label="Kegiatan" :nilai="terlihat.length" :ikon="ClipboardList" nada="emas" keterangan="Sesuai filter" ringkas />
      <DashboardKartuAngka label="Desa dikunjungi" :nilai="new Set(terlihat.map(item => item.desa_id)).size" :ikon="MapPinned" keterangan="Desa binaan berbeda" ringkas />
      <DashboardKartuAngka label="Total peserta" :nilai="totalPeserta" :ikon="Users" nada="info" keterangan="Orang" ringkas />
      <DashboardKartuAngka label="Dengan lampiran" :nilai="totalLampiran" :ikon="Paperclip" nada="sukses" keterangan="Foto atau PDF" ringkas />
    </section>

    <DashboardBingkaiTabel>
      <template #toolbar>
        <div class="flex flex-wrap items-center gap-2">
          <label for="filter-bulan" class="sr-only">Bulan</label>
          <Input id="filter-bulan" v-model="bulan" class="h-9 w-44 bg-card" type="month" />
          <label for="filter-desa" class="sr-only">Desa</label>
          <NativeSelect id="filter-desa" v-model="desaDipilih" class="h-9 w-44 bg-card"><NativeSelectOption value="">Semua desa</NativeSelectOption><NativeSelectOption v-for="[id, nama] in desaPilihan" :key="id" :value="id">{{ nama }}</NativeSelectOption></NativeSelect>
          <label for="filter-jenis-kegiatan" class="sr-only">Jenis kegiatan</label>
          <NativeSelect id="filter-jenis-kegiatan" v-model="jenisDipilih" class="h-9 w-48 bg-card"><NativeSelectOption value="">Semua jenis</NativeSelectOption><NativeSelectOption v-for="[id, nama] in jenisPilihan" :key="id" :value="id">{{ nama }}</NativeSelectOption></NativeSelect>
          <label for="filter-petugas" class="sr-only">Petugas</label>
          <NativeSelect id="filter-petugas" v-model="pegawaiDipilih" class="h-9 w-44 bg-card"><NativeSelectOption value="">Semua petugas</NativeSelectOption><NativeSelectOption v-for="[id, nama] in pegawaiPilihan" :key="id" :value="id">{{ nama }}</NativeSelectOption></NativeSelect>
          <Button v-if="adaFilter" variant="ghost" class="h-9 text-muted-foreground" @click="resetFilter"><X class="size-4" />Reset</Button>
          <Button variant="ghost" size="icon" class="ml-auto" aria-label="Muat ulang" @click="refresh()"><RotateCw class="size-4" /></Button>
        </div>
      </template>

      <div v-if="pending" class="p-4"><DashboardStateMemuat :baris="6" /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Laporan kegiatan belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!terlihat.length" class="p-4">
        <DashboardStateKosong :judul="kegiatan.length && adaFilter ? 'Tidak ada laporan yang sesuai filter.' : 'Belum ada laporan kegiatan bulan ini.'" deskripsi="Buat laporan setelah kegiatan di desa binaan selesai." :ikon="kegiatan.length && adaFilter ? FileSearch : CalendarDays">
          <Button v-if="adaFilter" variant="outline" @click="resetFilter">Reset filter</Button>
        </DashboardStateKosong>
      </div>
      <template v-else>
        <Table class="hidden min-w-[880px] md:table">
          <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Desa</TableHead><TableHead>Jenis kegiatan</TableHead><TableHead class="text-right">Peserta</TableHead><TableHead>Petugas</TableHead><TableHead>Lampiran</TableHead><TableHead class="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="item in terlihat" :key="item.id">
              <TableCell class="whitespace-nowrap font-medium">{{ formatTanggalWib(item.tanggal_kegiatan) }}</TableCell>
              <TableCell>{{ item.desa }}</TableCell>
              <TableCell><span class="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{{ item.jenis }}</span></TableCell>
              <TableCell class="text-right tabular-nums">{{ item.jumlah_peserta }}</TableCell>
              <TableCell><div class="flex flex-wrap items-center gap-2"><span>{{ item.pegawai }}</span><span v-if="item.petugas_pengganti_nama" class="rounded-full bg-peringatan-muda px-2 py-0.5 text-xs font-semibold text-peringatan">Digantikan</span></div><p v-if="item.petugas_pengganti_nama" class="mt-0.5 text-xs text-muted-foreground">Pengganti: {{ item.petugas_pengganti_nama }}</p></TableCell>
              <TableCell><div class="flex gap-1.5"><span v-if="item.foto_path" class="inline-flex size-7 items-center justify-center rounded-md bg-info-muda text-info" title="Foto dokumentasi"><Image class="size-3.5" /><span class="sr-only">Foto</span></span><span v-if="item.pdf_path" class="inline-flex size-7 items-center justify-center rounded-md bg-bahaya-muda text-destructive" title="Laporan PDF"><FileText class="size-3.5" /><span class="sr-only">PDF</span></span><span v-if="!item.foto_path && !item.pdf_path" class="text-muted-foreground">—</span></div></TableCell>
              <TableCell>
                <div class="flex items-center justify-end gap-1">
                  <Button size="sm" variant="ghost" @click="bukaUbah(item.id)"><Pencil class="size-3.5" />Ubah</Button>
                  <AlertDialog v-if="sisaMenit(item) > 0">
                    <AlertDialogTrigger as-child><Button size="sm" variant="ghost" class="text-destructive hover:bg-bahaya-muda hover:text-destructive" :title="`Dapat dihapus ${sisaMenit(item)} menit lagi`"><Trash2 class="size-3.5" />Hapus</Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus laporan ini?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="konfirmasiHapus(item.id)">Hapus laporan</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
                <p v-if="sisaMenit(item) > 0" class="mt-0.5 text-right text-xs text-muted-foreground">Dapat dihapus {{ sisaMenit(item) }} menit lagi</p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ul class="divide-y md:hidden">
          <li v-for="item in terlihat" :key="item.id" class="grid gap-2 px-4 py-3.5">
            <div class="flex items-start justify-between gap-3"><div><p class="font-medium">{{ item.desa }}</p><p class="text-xs text-muted-foreground">{{ formatTanggalWib(item.tanggal_kegiatan) }} · {{ item.jenis }}</p></div><span v-if="item.petugas_pengganti_nama" class="rounded-full bg-peringatan-muda px-2 py-0.5 text-xs font-semibold text-peringatan">Digantikan</span></div>
            <p class="text-sm text-muted-foreground">{{ item.pegawai }} · {{ item.jumlah_peserta }} peserta</p>
            <div class="flex items-center justify-between gap-2"><span v-if="sisaMenit(item) > 0" class="text-xs text-muted-foreground">Dapat dihapus {{ sisaMenit(item) }} menit lagi</span><Button size="sm" variant="outline" class="ml-auto" @click="bukaUbah(item.id)">Ubah laporan</Button></div>
          </li>
        </ul>
      </template>
      <template #footer><p v-if="pesan" class="border-t bg-bahaya-muda px-4 py-3 text-sm text-destructive" role="alert">{{ pesan }}</p></template>
    </DashboardBingkaiTabel>

    <Dialog v-model:open="formTerbuka">
      <DialogContent class="max-h-[calc(100svh-2rem)] max-w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader class="border-b border-border px-5 py-5 pr-12 sm:px-7"><DialogTitle class="text-xl text-primary">{{ kegiatanDiubahId ? 'Ubah laporan kegiatan' : 'Buat laporan kegiatan' }}</DialogTitle><DialogDescription>{{ kegiatanDiubahId ? 'Perbarui informasi kegiatan dan lampirannya.' : 'Lengkapi data kegiatan PIMPASA yang telah dilakukan.' }}</DialogDescription></DialogHeader>
        <div class="max-h-[calc(100svh-11rem)] min-w-0 overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-7"><KegiatanForm :id="kegiatanDiubahId" :desa-id-awal="desaAwal" @tersimpan="selesaiSimpan" @tutup="formTerbuka = false" /></div>
      </DialogContent>
    </Dialog>
  </div>
</template>
