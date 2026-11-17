<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import { formatTanggalWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Desa binaan' })
const kelola = useKelolaKanwil()
const { data, pending, error, refresh } = await useAsyncData('kanwil-desa-binaan', () => kelola.daftarDesa())
const bukaTambah = ref(false)
const menyimpan = ref(false)
const pesan = ref('')
const kabupatenId = ref('')
const kecamatanId = ref('')
const desaId = ref('')
const pilihan = ref<{ kabupaten: { id: string; nama: string; jenis: string }[]; kecamatan: { id: string; nama: string }[]; desa: { id: string; nama: string; dbi: boolean }[] }>({ kabupaten: [], kecamatan: [], desa: [] })
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
  <div class="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 sm:gap-6">
    <header class="flex min-w-0 flex-col gap-4 border-l-2 border-accent py-1 pl-4 sm:flex-row sm:items-end sm:justify-between"><div class="min-w-0 space-y-1"><p class="text-sm font-semibold text-muted-foreground">Program PIMPASA</p><h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Desa Binaan Imigrasi</h1><p class="text-sm leading-6 text-muted-foreground">Kelola desa binaan dan lihat penugasan PIMPASA aktif.</p></div><Button class="w-full sm:w-auto" @click="bukaFormTambah">Tetapkan desa binaan</Button></header>
    <Alert><AlertTitle>Catatan pengelolaan</AlertTitle><AlertDescription>Perubahan DBI langsung berlaku. Penugasan aktif akan diakhiri otomatis saat status DBI dicabut.</AlertDescription></Alert>
    <Card><CardHeader><CardTitle>Daftar desa binaan</CardTitle><CardDescription>{{ data?.length ?? 0 }} desa telah ditetapkan sebagai DBI.</CardDescription></CardHeader><CardContent><div v-if="pending" class="grid gap-3"><Skeleton v-for="i in 5" :key="i" class="h-12 w-full" /></div><div v-else-if="error" class="grid gap-3 text-sm text-destructive" role="alert">Daftar desa binaan belum dapat dimuat.<Button class="w-fit" variant="outline" @click="refresh()">Coba lagi</Button></div><Table v-else><TableHeader><TableRow><TableHead>Desa/Kelurahan</TableHead><TableHead>Kecamatan</TableHead><TableHead>Kabupaten/Kota</TableHead><TableHead>UPT</TableHead><TableHead>PIMPASA aktif</TableHead><TableHead>Kegiatan terakhir</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data" :key="item.id"><TableCell class="font-medium">{{ item.nama }}</TableCell><TableCell>{{ item.kecamatan }}</TableCell><TableCell>{{ item.kabupaten }}</TableCell><TableCell>{{ item.kantor }}</TableCell><TableCell>{{ item.petugas.length ? item.petugas.join(', ') : 'Belum ada' }}</TableCell><TableCell>{{ item.kegiatanTerakhir ? formatTanggalWib(item.kegiatanTerakhir) : 'Belum ada' }}</TableCell><TableCell><AlertDialog><AlertDialogTrigger as-child><Button variant="destructive" size="sm">Cabut DBI</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cabut status DBI?</AlertDialogTitle><AlertDialogDescription>{{ item.penugasanAktif }} penugasan PIMPASA aktif di {{ item.nama }} akan diakhiri otomatis dengan alasan desa dicabut.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="cabut(item)">Cabut status DBI</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow><TableEmpty v-if="!data?.length" :colspan="7">Belum ada desa binaan.</TableEmpty></TableBody></Table></CardContent></Card>
    <Dialog v-model:open="bukaTambah"><DialogContent><DialogHeader><DialogTitle>Tetapkan Desa Binaan Imigrasi</DialogTitle><DialogDescription>Pilih wilayah dan desa yang belum berstatus DBI.</DialogDescription></DialogHeader><div class="grid gap-4"><label class="grid gap-2 text-sm font-medium">Kabupaten/Kota<NativeSelect v-model="kabupatenId"><NativeSelectOption value="">Pilih kabupaten/kota</NativeSelectOption><NativeSelectOption v-for="item in pilihan.kabupaten" :key="item.id" :value="item.id">{{ item.jenis }} {{ item.nama }}</NativeSelectOption></NativeSelect></label><label class="grid gap-2 text-sm font-medium">Kecamatan<NativeSelect v-model="kecamatanId" :disabled="!kabupatenId"><NativeSelectOption value="">Pilih kecamatan</NativeSelectOption><NativeSelectOption v-for="item in pilihan.kecamatan" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect></label><label class="grid gap-2 text-sm font-medium">Desa/Kelurahan<NativeSelect v-model="desaId" :disabled="!kecamatanId"><NativeSelectOption value="">Pilih desa yang belum DBI</NativeSelectOption><NativeSelectOption v-for="item in tersedia" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect><span v-if="kecamatanId && !tersedia.length" class="text-xs text-muted-foreground">Semua desa di kecamatan ini sudah berstatus DBI.</span></label><p v-if="pesan" class="text-sm text-destructive" role="alert">{{ pesan }}</p></div><DialogFooter><Button variant="outline" @click="bukaTambah = false">Batal</Button><Button :disabled="!desaId || menyimpan" @click="tetapkan">{{ menyimpan ? 'Menyimpan…' : 'Tetapkan DBI' }}</Button></DialogFooter></DialogContent></Dialog>
  </div>
</template>
