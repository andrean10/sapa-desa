<script setup lang="ts">
import { CalendarDays, ChevronRight, FileText, Image, Plus, SlidersHorizontal } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { formatTanggalWib, tanggalHariIniWib } from '~~/shared/utils/waktu'
import KegiatanForm from '~/components/upt/KegiatanForm.vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Skeleton } from '~/components/ui/skeleton'

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
  <div class="mx-auto grid w-full max-w-screen-2xl gap-5 sm:gap-6">
    <header class="flex flex-col gap-5 border-l-2 border-accent py-1 pl-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="min-w-0 space-y-1.5">
        <p class="text-sm font-semibold text-muted-foreground">PIMPASA</p>
        <h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Laporan kegiatan</h1>
        <p class="max-w-2xl text-sm leading-6 text-muted-foreground">Catat kegiatan di desa binaan dan simpan dokumentasinya dalam satu laporan.</p>
      </div>
      <Button class="min-h-11 w-full sm:w-auto" @click="bukaForm()"><Plus class="size-4" />Buat laporan kegiatan</Button>
    </header>

    <section class="grid gap-3 sm:grid-cols-3" aria-label="Ringkasan kegiatan">
      <Card class="gap-3 border-t-2 border-t-primary py-4"><CardHeader class="gap-1 pb-0"><CardDescription>Kegiatan bulan ini</CardDescription><CardTitle class="text-3xl font-bold tabular-nums text-primary">{{ terlihat.length }}</CardTitle></CardHeader></Card>
      <Card class="gap-3 py-4"><CardHeader class="gap-1 pb-0"><CardDescription>Desa tercatat</CardDescription><CardTitle class="text-3xl font-bold tabular-nums">{{ new Set(terlihat.map(item => item.desa_id)).size }}</CardTitle></CardHeader></Card>
      <Card class="gap-3 py-4"><CardHeader class="gap-1 pb-0"><CardDescription>Dengan lampiran</CardDescription><CardTitle class="text-3xl font-bold tabular-nums">{{ totalLampiran }}</CardTitle></CardHeader></Card>
    </section>

    <Card>
      <CardHeader class="gap-2"><div class="flex items-center gap-2"><SlidersHorizontal class="size-4 text-primary" /><CardTitle>Filter kegiatan</CardTitle></div><CardDescription>Gunakan filter untuk menemukan laporan yang sudah dicatat.</CardDescription></CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label class="grid gap-1.5 text-sm font-medium">Bulan<Input v-model="bulan" class="h-11" type="month" /></label>
        <label class="grid gap-1.5 text-sm font-medium">Desa<NativeSelect v-model="desaDipilih" class="h-11"><NativeSelectOption value="">Semua desa</NativeSelectOption><NativeSelectOption v-for="[id, nama] in desaPilihan" :key="id" :value="id">{{ nama }}</NativeSelectOption></NativeSelect></label>
        <label class="grid gap-1.5 text-sm font-medium">Jenis kegiatan<NativeSelect v-model="jenisDipilih" class="h-11"><NativeSelectOption value="">Semua jenis</NativeSelectOption><NativeSelectOption v-for="[id, nama] in jenisPilihan" :key="id" :value="id">{{ nama }}</NativeSelectOption></NativeSelect></label>
        <label class="grid gap-1.5 text-sm font-medium">Petugas<NativeSelect v-model="pegawaiDipilih" class="h-11"><NativeSelectOption value="">Semua petugas</NativeSelectOption><NativeSelectOption v-for="[id, nama] in pegawaiPilihan" :key="id" :value="id">{{ nama }}</NativeSelectOption></NativeSelect></label>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex-row items-start justify-between gap-4"><div class="space-y-1"><CardTitle>Riwayat kegiatan</CardTitle><CardDescription>{{ terlihat.length }} laporan sesuai filter yang dipilih.</CardDescription></div><Button variant="outline" size="sm" @click="refresh()">Muat ulang</Button></CardHeader>
      <CardContent>
        <div v-if="pending" class="grid gap-3"><Skeleton v-for="i in 5" :key="i" class="h-14 w-full" /></div>
        <div v-else-if="error" class="grid gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive" role="alert">Laporan kegiatan belum dapat dimuat.<Button class="w-fit" variant="outline" @click="refresh()">Coba lagi</Button></div>
        <div v-else-if="!terlihat.length" class="grid place-items-center gap-3 rounded-lg border border-dashed py-12 text-center"><div class="grid size-11 place-items-center rounded-lg bg-muted"><CalendarDays class="size-5 text-muted-foreground" /></div><div><p class="font-semibold">{{ kegiatan.length ? 'Tidak ada laporan yang sesuai filter.' : 'Belum ada laporan kegiatan bulan ini.' }}</p><p class="mt-1 text-sm text-muted-foreground">Buat laporan setelah kegiatan di desa binaan selesai.</p></div><Button @click="bukaForm()"><Plus class="size-4" />Buat laporan kegiatan</Button></div>
        <template v-else>
          <div class="hidden overflow-x-auto md:block"><Table><TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Desa</TableHead><TableHead>Jenis kegiatan</TableHead><TableHead>Peserta</TableHead><TableHead>Petugas</TableHead><TableHead>Lampiran</TableHead><TableHead class="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in terlihat" :key="item.id"><TableCell class="whitespace-nowrap font-medium">{{ formatTanggalWib(item.tanggal_kegiatan) }}</TableCell><TableCell><p class="font-medium">{{ item.desa }}</p></TableCell><TableCell>{{ item.jenis }}</TableCell><TableCell class="tabular-nums">{{ item.jumlah_peserta }}</TableCell><TableCell><div class="flex flex-wrap items-center gap-2"><span>{{ item.pegawai }}</span><Badge v-if="item.petugas_pengganti" variant="secondary">Digantikan</Badge></div></TableCell><TableCell><div class="flex gap-1.5"><span v-if="item.foto_path" class="inline-flex size-7 items-center justify-center rounded-md bg-muted" title="Foto dokumentasi"><Image class="size-3.5" /></span><span v-if="item.pdf_path" class="inline-flex size-7 items-center justify-center rounded-md bg-muted" title="Laporan PDF"><FileText class="size-3.5" /></span><span v-if="!item.foto_path && !item.pdf_path" class="text-muted-foreground">—</span></div></TableCell><TableCell><div class="flex justify-end gap-1"><Button size="sm" variant="ghost" @click="bukaUbah(item.id)">Ubah<ChevronRight class="size-4" /></Button><AlertDialog v-if="sisaMenit(item) > 0"><AlertDialogTrigger as-child><Button size="sm" variant="ghost" class="text-destructive hover:bg-destructive/10 hover:text-destructive">Hapus</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus laporan kegiatan?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="konfirmasiHapus(item.id)">Hapus laporan</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div><p v-if="sisaMenit(item) > 0" class="mt-1 text-right text-xs text-muted-foreground">{{ sisaMenit(item) }} menit</p></TableCell></TableRow></TableBody></Table></div>
          <div class="grid gap-3 md:hidden"><article v-for="item in terlihat" :key="item.id" class="rounded-lg border border-border p-4"><div class="flex items-start justify-between gap-3"><div><p class="font-semibold text-primary">{{ item.desa }}</p><p class="mt-1 text-sm text-muted-foreground">{{ formatTanggalWib(item.tanggal_kegiatan) }} · {{ item.jenis }}</p></div><Badge v-if="item.petugas_pengganti" variant="secondary">Digantikan</Badge></div><div class="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3 text-sm"><div><p class="text-muted-foreground">Petugas</p><p class="mt-1 font-medium">{{ item.pegawai }}</p></div><div><p class="text-muted-foreground">Peserta</p><p class="mt-1 font-medium tabular-nums">{{ item.jumlah_peserta }} orang</p></div></div><div class="mt-3 flex items-center justify-between gap-3"><div class="flex gap-1.5"><span v-if="item.foto_path" class="inline-flex size-7 items-center justify-center rounded-md bg-muted"><Image class="size-3.5" /></span><span v-if="item.pdf_path" class="inline-flex size-7 items-center justify-center rounded-md bg-muted"><FileText class="size-3.5" /></span></div><Button size="sm" variant="outline" @click="bukaUbah(item.id)">Ubah laporan</Button></div></article></div>
        </template>
        <p v-if="pesan" class="mt-4 text-sm text-destructive" role="alert">{{ pesan }}</p>
      </CardContent>
    </Card>

    <Dialog v-model:open="formTerbuka">
      <DialogContent class="max-h-[calc(100svh-2rem)] max-w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader class="border-b border-border px-5 py-5 pr-12 sm:px-7"><DialogTitle class="text-xl text-primary">{{ kegiatanDiubahId ? 'Ubah laporan kegiatan' : 'Buat laporan kegiatan' }}</DialogTitle><DialogDescription>{{ kegiatanDiubahId ? 'Perbarui informasi kegiatan dan lampirannya.' : 'Lengkapi data kegiatan PIMPASA yang telah dilakukan.' }}</DialogDescription></DialogHeader>
        <div class="max-h-[calc(100svh-11rem)] overflow-y-auto px-5 py-6 sm:px-7"><KegiatanForm :id="kegiatanDiubahId" :desa-id-awal="desaAwal" @tersimpan="selesaiSimpan" @tutup="formTerbuka = false" /></div>
      </DialogContent>
    </Dialog>
  </div>
</template>
