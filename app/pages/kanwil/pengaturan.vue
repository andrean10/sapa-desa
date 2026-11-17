<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Pencil, Plus } from '@lucide/vue'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'

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
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Pengaturan" deskripsi="Kebijakan kerja dan jenis kegiatan PIMPASA." />
    <DashboardSegmenTab :items="[{ value: 'umum', label: 'Umum' }, { value: 'jenis', label: 'Jenis kegiatan', jumlah: data?.jenis.length }]" :aktif="tab" label="Bagian pengaturan" @pilih="value => tab = value as typeof tab" />
    <div v-if="pending"><DashboardStateMemuat :baris="3" tinggi="h-28" /></div>
    <DashboardStateGalat v-else-if="error" pesan="Pengaturan belum dapat dimuat." @coba="refresh()" />
    <div v-else-if="tab === 'umum'" class="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
      <form v-for="item in aturan" :key="item.kunci" class="grid gap-4 border-b p-5 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center" @submit.prevent="simpanNilai(item)">
        <div class="space-y-1"><label :for="`atur-${item.kunci}`" class="font-medium">{{ item.judul }}</label><p class="max-w-2xl text-sm text-muted-foreground">{{ item.bantuan }}</p><p v-if="pesan[item.kunci]" class="text-sm text-destructive" role="alert">{{ pesan[item.kunci] }}</p></div>
        <div class="flex items-center gap-2">
          <Input :id="`atur-${item.kunci}`" v-model="nilai[item.kunci]" class="h-9 w-32 text-right tabular-nums" type="number" :min="item.min" :max="item.max" required />
          <Button type="submit" variant="outline" :disabled="sedangSimpan === item.kunci">{{ sedangSimpan === item.kunci ? 'Menyimpan…' : 'Simpan' }}</Button>
        </div>
      </form>
    </div>
    <DashboardKartuBagian v-else judul="Jenis kegiatan PIMPASA" deskripsi="Jenis aktif tersedia di formulir laporan kegiatan UPT. Jenis tidak dapat dihapus." rapat>
      <template #aksi><Button size="sm" @click="bukaJenis()"><Plus class="size-4" />Tambah jenis</Button></template>
      <div v-if="!data?.jenis.length" class="border-t p-5"><DashboardStateKosong judul="Belum ada jenis kegiatan." ringkas /></div>
      <ul v-else class="divide-y border-t">
        <li v-for="item in data.jenis" :key="item.id" class="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div class="flex items-center gap-3"><span class="font-medium" :class="item.aktif ? '' : 'text-muted-foreground line-through decoration-muted-foreground/40'">{{ item.nama }}</span><span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="item.aktif ? 'bg-sukses-muda text-sukses' : 'bg-muted text-muted-foreground'">{{ item.aktif ? 'Aktif' : 'Nonaktif' }}</span></div>
          <div class="flex items-center gap-3"><Button variant="ghost" size="sm" @click="bukaJenis(item)"><Pencil class="size-3.5" />Ubah nama</Button><Switch :model-value="item.aktif" :aria-label="item.aktif ? `Nonaktifkan ${item.nama}` : `Aktifkan ${item.nama}`" @update:model-value="gantiAktif(item)" /></div>
        </li>
      </ul>
    </DashboardKartuBagian>
    <Dialog v-model:open="dialogJenis">
      <DialogContent>
        <DialogHeader><DialogTitle>{{ jenisId ? 'Ubah jenis kegiatan' : 'Tambah jenis kegiatan' }}</DialogTitle><DialogDescription>Nama maksimal 100 karakter. Jenis yang dinonaktifkan tetap tercatat pada laporan lama.</DialogDescription></DialogHeader>
        <div class="grid gap-4">
          <label class="grid gap-1.5 text-sm font-medium">Nama jenis kegiatan<Input v-model="namaJenis" maxlength="100" required /></label>
          <label v-if="jenisId" class="flex items-center gap-2 text-sm"><Checkbox v-model="jenisAktif" />Aktif</label>
          <p v-if="pesan.jenis" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesan.jenis }}</p>
        </div>
        <DialogFooter><Button variant="outline" @click="dialogJenis = false">Batal</Button><Button :disabled="sedangSimpan === 'jenis'" @click="simpanJenis">{{ sedangSimpan === 'jenis' ? 'Menyimpan…' : 'Simpan jenis' }}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
