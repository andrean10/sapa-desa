<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Pencil, Plus } from '@lucide/vue'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', title: 'Pengaturan' })
const kelola = useKelolaKanwil()
const { data, pending, error, refresh } = await useAsyncData('kanwil-pengaturan', () => kelola.daftarPengaturan())
const tab = ref<'umum' | 'jenis'>('umum')
const nilai = reactive<Record<string, string>>({})
const sedangSimpan = ref('')
const pesan = reactive<Record<string, string>>({})
// Isian yang sedang diedit (beda dari nilai server sebelumnya) tidak ditimpa saat data dimuat ulang.
const nilaiServer: Record<string, string> = {}
watch(data, (hasil) => {
  for (const item of hasil?.pengaturan ?? []) {
    if (nilai[item.kunci] === undefined || nilai[item.kunci] === nilaiServer[item.kunci]) nilai[item.kunci] = item.nilai
    nilaiServer[item.kunci] = item.nilai
  }
}, { immediate: true })
const aturan = [
  { kunci: 'batas_hari_tanggap', judul: 'Batas hari laporan belum ditanggapi', bantuan: 'Berlaku untuk pantauan Kanwil dan penanda terlambat di dashboard UPT. Tidak termasuk hari libur.', min: 1, max: 999 },
  { kunci: 'batas_menit_hapus_laporan', judul: 'Waktu hapus laporan kegiatan (menit)', bantuan: 'Lama UPT boleh menghapus laporan kegiatan setelah dibuat.', min: 1, max: 999 },
  { kunci: 'toleransi_batas_meter', judul: 'Toleransi jarak dari batas Riau (meter)', bantuan: 'Menutup selisih GPS dan garis pantai.', min: 0, max: 99999 }
]
async function simpanNilai(item: typeof aturan[number]) {
  pesan[item.kunci] = ''; sedangSimpan.value = item.kunci
  const jumlah = Number(nilai[item.kunci])
  if (!Number.isInteger(jumlah) || jumlah < item.min || jumlah > item.max) { pesan[item.kunci] = `Isi angka ${item.min} sampai ${item.max}.`; sedangSimpan.value = ''; return }
  try { await kelola.simpanPengaturan(item.kunci, jumlah); await refresh(); toast.success(`${item.judul} disimpan.`) }
  catch (galat) { pesan[item.kunci] = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? `${item.judul} belum dapat disimpan.` }
  finally { sedangSimpan.value = '' }
}
const dialogJenis = ref(false)
const jenisId = ref('')
const namaJenis = ref('')
const jenisAktif = ref(true)
function bukaJenis(item?: { id: string; nama: string; aktif: boolean }) { jenisId.value = item?.id ?? ''; namaJenis.value = item?.nama ?? ''; jenisAktif.value = item?.aktif ?? true; pesan.jenis = ''; dialogJenis.value = true }
async function simpanJenis() {
  pesan.jenis = ''; sedangSimpan.value = 'jenis'
  try { await kelola.simpanJenis({ id: jenisId.value || undefined, nama: namaJenis.value, aktif: jenisAktif.value }); await refresh(); dialogJenis.value = false; toast.success(jenisId.value ? 'Jenis kegiatan diperbarui.' : 'Jenis kegiatan ditambahkan.') }
  catch (galat) { pesan.jenis = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Jenis kegiatan belum dapat disimpan.' }
  finally { sedangSimpan.value = '' }
}
async function gantiAktif(item: { id: string; nama: string; aktif: boolean }) {
  try { await kelola.simpanJenis({ id: item.id, nama: item.nama, aktif: !item.aktif }); await refresh(); toast.success(`Jenis kegiatan ${item.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`) }
  catch (galat) { toast.error((galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Status jenis kegiatan belum dapat diubah.') }
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 sm:gap-6">
    <header class="space-y-1 border-l-2 border-accent py-1 pl-4"><p class="text-sm font-semibold text-muted-foreground">Administrasi Kanwil</p><h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Pengaturan sistem</h1><p class="text-sm leading-6 text-muted-foreground">Nilai kebijakan kerja dan jenis kegiatan PIMPASA.</p></header>
    <div class="flex gap-2" role="tablist" aria-label="Bagian pengaturan"><Button role="tab" :aria-selected="tab === 'umum'" :variant="tab === 'umum' ? 'default' : 'outline'" @click="tab = 'umum'">Umum</Button><Button role="tab" :aria-selected="tab === 'jenis'" :variant="tab === 'jenis' ? 'default' : 'outline'" @click="tab = 'jenis'">Jenis kegiatan</Button></div>
    <div v-if="pending" class="grid gap-4"><Skeleton v-for="i in 3" :key="i" class="h-32 w-full" /></div><Card v-else-if="error" role="alert"><CardHeader><CardTitle>Pengaturan belum dapat dimuat</CardTitle></CardHeader><CardContent><Button variant="outline" @click="refresh()">Coba lagi</Button></CardContent></Card>
    <template v-else-if="tab === 'umum'"><Card v-for="item in aturan" :key="item.kunci"><CardHeader class="pb-3"><CardTitle class="text-base">{{ item.judul }}</CardTitle><CardDescription>{{ item.bantuan }}</CardDescription></CardHeader><CardContent><form class="flex flex-wrap items-end gap-3" @submit.prevent="simpanNilai(item)"><label class="grid gap-2 text-sm font-medium">Nilai saat ini<Input v-model="nilai[item.kunci]" class="w-44" type="number" :min="item.min" :max="item.max" required /></label><Button type="submit" :disabled="sedangSimpan === item.kunci">{{ sedangSimpan === item.kunci ? 'Menyimpan…' : 'Simpan perubahan' }}</Button><p v-if="pesan[item.kunci]" class="basis-full text-sm text-destructive" role="alert">{{ pesan[item.kunci] }}</p></form></CardContent></Card></template>
    <Card v-else><CardHeader class="flex-row items-center justify-between"><div><CardTitle>Jenis kegiatan PIMPASA</CardTitle><CardDescription>Jenis yang aktif tersedia pada formulir laporan kegiatan UPT.</CardDescription></div><Button @click="bukaJenis()"><Plus class="mr-2 size-4" />Tambah jenis</Button></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Status</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data?.jenis" :key="item.id"><TableCell class="font-medium">{{ item.nama }}</TableCell><TableCell><Badge :variant="item.aktif ? 'default' : 'secondary'">{{ item.aktif ? 'Aktif' : 'Nonaktif' }}</Badge></TableCell><TableCell><div class="flex gap-2"><Button variant="outline" size="sm" @click="bukaJenis(item)"><Pencil class="mr-1 size-3.5" />Ubah</Button><Button :variant="item.aktif ? 'secondary' : 'outline'" size="sm" @click="gantiAktif(item)">{{ item.aktif ? 'Nonaktifkan' : 'Aktifkan' }}</Button></div></TableCell></TableRow><TableEmpty v-if="!data?.jenis.length" :colspan="3">Belum ada jenis kegiatan.</TableEmpty></TableBody></Table></CardContent></Card>
    <Dialog v-model:open="dialogJenis"><DialogContent><DialogHeader><DialogTitle>{{ jenisId ? 'Ubah jenis kegiatan' : 'Tambah jenis kegiatan' }}</DialogTitle><DialogDescription>Nama maksimal 100 karakter. Jenis yang dinonaktifkan tetap tercatat pada laporan lama.</DialogDescription></DialogHeader><div class="grid gap-4"><label class="grid gap-2 text-sm font-medium">Nama jenis kegiatan<Input v-model="namaJenis" maxlength="100" required /></label><label v-if="jenisId" class="flex items-center gap-2 text-sm"><Checkbox v-model="jenisAktif" />Aktif</label><p v-if="pesan.jenis" class="text-sm text-destructive" role="alert">{{ pesan.jenis }}</p></div><DialogFooter><Button variant="outline" @click="dialogJenis = false">Batal</Button><Button :disabled="sedangSimpan === 'jenis'" @click="simpanJenis">{{ sedangSimpan === 'jenis' ? 'Menyimpan…' : 'Simpan jenis' }}</Button></DialogFooter></DialogContent></Dialog>
  </div>
</template>
