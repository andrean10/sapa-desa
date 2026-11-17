<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { ALASAN_BERAKHIR_PENUGASAN } from '~~/shared/config/teks'
import { CalendarCog, Lock, UserRoundCog, UserRoundPlus, X } from '@lucide/vue'
import { formatTanggalWib, tanggalHariIniWib } from '~~/shared/utils/waktu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'

definePageMeta({ layout: 'dashboard', title: 'Penugasan PIMPASA' })
const kelola = useKelolaKanwil()
const status = ref<'true' | 'false' | ''>('true')
const kantorId = ref('')
const desaIdFilter = ref('')
const pegawaiIdFilter = ref('')
const query = computed(() => ({ aktif: status.value, kantorId: kantorId.value, desaId: desaIdFilter.value, pegawaiId: pegawaiIdFilter.value }))
const { data, pending, error, refresh } = await useAsyncData('kanwil-penugasan', () => kelola.daftarPenugasan(query.value), { watch: [query], default: () => ({ data: [], kantor: [] }) })
const { data: opsi, pending: opsiPending } = await useAsyncData('kanwil-penugasan-opsi', () => kelola.pilihanPenugasan(), { default: () => ({ desa: [], pegawai: [], kantor: [], error: null }) })
const tambahTerbuka = ref(false)
const simpanDialog = ref(false)
const sedangSimpan = ref(false)
const pesan = ref('')
const inputBaru = reactive({ desa_id: '', pegawai_id: '', tanggal_mulai: tanggalHariIniWib() })
const editItem = ref<(typeof data.value.data)[number]>()
const modeEdit = ref<'koreksi' | 'akhiri'>('koreksi')
const inputTanggal = reactive({ tanggal_mulai: '', tanggal_selesai: tanggalHariIniWib(), alasan_berakhir: 'rotasi' as string })
const desaTersaring = computed(() => kantorId.value ? opsi.value?.desa.filter(item => item.kantor_id === kantorId.value) : opsi.value?.desa ?? [])
const pegawaiTersaring = computed(() => {
  const kantor = opsi.value?.desa.find(item => item.id === inputBaru.desa_id)?.kantor_id
  return opsi.value?.pegawai.filter(item => item.kantor_id === kantor) ?? []
})
const filterPegawai = computed(() => kantorId.value ? opsi.value?.pegawai.filter(item => item.kantor_id === kantorId.value) ?? [] : opsi.value?.pegawai ?? [])
const labelAlasan = (nilai: string | null) => ALASAN_BERAKHIR_PENUGASAN.find(item => item.value === nilai)?.label ?? '—'
function mulaiTambah() { inputBaru.desa_id = ''; inputBaru.pegawai_id = ''; inputBaru.tanggal_mulai = tanggalHariIniWib(); pesan.value = ''; tambahTerbuka.value = true }
watch(() => inputBaru.desa_id, () => { if (!pegawaiTersaring.value.some(item => item.id === inputBaru.pegawai_id)) inputBaru.pegawai_id = '' })
function mulaiUbah(item: (typeof data.value.data)[number], mode: 'koreksi' | 'akhiri') {
  editItem.value = item; modeEdit.value = mode; inputTanggal.tanggal_mulai = item.tanggal_mulai; inputTanggal.tanggal_selesai = mode === 'koreksi' ? item.tanggal_selesai ?? tanggalHariIniWib() : tanggalHariIniWib(); inputTanggal.alasan_berakhir = 'rotasi'; pesan.value = ''; simpanDialog.value = true
}
async function simpanBaru() {
  pesan.value = ''; sedangSimpan.value = true
  try { await kelola.buatPenugasan(inputBaru); await refresh(); tambahTerbuka.value = false; toast.success('Penugasan PIMPASA berhasil dibuat.') }
  catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Penugasan belum dapat dibuat.' }
  finally { sedangSimpan.value = false }
}
async function simpanPerubahan() {
  if (!editItem.value) return
  pesan.value = ''; sedangSimpan.value = true
  try {
    const body = modeEdit.value === 'akhiri'
      ? { tanggal_selesai: inputTanggal.tanggal_selesai, alasan_berakhir: inputTanggal.alasan_berakhir as 'rotasi' | 'mutasi' | 'lainnya' }
      : { tanggal_mulai: inputTanggal.tanggal_mulai, tanggal_selesai: editItem.value.tanggal_selesai ? inputTanggal.tanggal_selesai || null : null }
    await kelola.ubahPenugasan(editItem.value.id, body); await refresh(); simpanDialog.value = false; toast.success(modeEdit.value === 'akhiri' ? 'Penugasan telah diakhiri.' : 'Tanggal penugasan diperbarui.')
  } catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Penugasan belum dapat diperbarui.' }
  finally { sedangSimpan.value = false }
}
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Penugasan PIMPASA" deskripsi="Tugaskan pegawai aktif UPT pada desa binaan. Penugasan yang berakhir tetap tersimpan sebagai riwayat.">
      <template #aksi><Button :disabled="opsiPending" @click="mulaiTambah"><UserRoundPlus class="size-4" />Tugaskan PIMPASA</Button></template>
    </DashboardKepalaHalaman>
    <DashboardSegmenTab :items="[{ value: 'true', label: 'Berlaku' }, { value: 'false', label: 'Riwayat' }, { value: '', label: 'Semua' }]" :aktif="status" label="Status penugasan" @pilih="value => status = value as typeof status" />

    <DashboardBingkaiTabel>
      <template #toolbar>
        <div class="flex flex-wrap items-center gap-2">
          <label for="filter-upt" class="sr-only">UPT</label>
          <NativeSelect id="filter-upt" v-model="kantorId" class="h-9 w-48 bg-card"><NativeSelectOption value="">Semua UPT</NativeSelectOption><NativeSelectOption v-for="item in data.kantor" :key="item.id" :value="item.id">{{ item.nama_singkat }}</NativeSelectOption></NativeSelect>
          <label for="filter-desa" class="sr-only">Desa binaan</label>
          <NativeSelect id="filter-desa" v-model="desaIdFilter" class="h-9 w-48 bg-card"><NativeSelectOption value="">Semua desa</NativeSelectOption><NativeSelectOption v-for="item in desaTersaring" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect>
          <label for="filter-pegawai" class="sr-only">Pegawai</label>
          <NativeSelect id="filter-pegawai" v-model="pegawaiIdFilter" class="h-9 w-48 bg-card"><NativeSelectOption value="">Semua pegawai</NativeSelectOption><NativeSelectOption v-for="item in filterPegawai" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect>
          <Button v-if="kantorId || desaIdFilter || pegawaiIdFilter" variant="ghost" class="h-9 text-muted-foreground" @click="kantorId = ''; desaIdFilter = ''; pegawaiIdFilter = ''"><X class="size-4" />Reset</Button>
        </div>
      </template>
      <div v-if="pending" class="p-4"><DashboardStateMemuat /></div>
      <div v-else-if="error" class="p-4"><DashboardStateGalat pesan="Daftar penugasan belum dapat dimuat." @coba="refresh()" /></div>
      <div v-else-if="!data.data.length" class="p-4"><DashboardStateKosong judul="Belum ada penugasan untuk filter ini." :ikon="UserRoundCog" /></div>
      <Table v-else class="min-w-[960px]">
        <TableHeader><TableRow><TableHead>Pegawai</TableHead><TableHead>UPT</TableHead><TableHead>Desa binaan</TableHead><TableHead>Masa tugas</TableHead><TableHead>Status</TableHead><TableHead class="text-right"><span class="sr-only">Aksi</span></TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow v-for="item in data.data" :key="item.id">
            <TableCell class="font-medium">{{ item.pegawai }}</TableCell>
            <TableCell>{{ item.kantor }}</TableCell>
            <TableCell>{{ item.desa }}</TableCell>
            <TableCell class="whitespace-nowrap tabular-nums">{{ formatTanggalWib(`${item.tanggal_mulai}T00:00:00+07:00`) }} <span class="text-muted-foreground">–</span> {{ item.tanggal_selesai ? formatTanggalWib(`${item.tanggal_selesai}T00:00:00+07:00`) : 'sekarang' }}</TableCell>
            <TableCell><span v-if="!item.tanggal_selesai" class="inline-flex items-center gap-1.5 rounded-full bg-sukses-muda px-2 py-0.5 text-xs font-semibold text-sukses"><span class="size-1.5 rounded-full bg-current" />Berlaku</span><span v-else class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Berakhir · {{ labelAlasan(item.alasan_berakhir) }}</span></TableCell>
            <TableCell><div class="flex justify-end gap-1"><Button size="sm" variant="ghost" @click="mulaiUbah(item, 'koreksi')"><CalendarCog class="size-3.5" />Koreksi tanggal</Button><Button v-if="!item.tanggal_selesai" size="sm" variant="ghost" class="text-destructive hover:bg-bahaya-muda hover:text-destructive" @click="mulaiUbah(item, 'akhiri')">Akhiri</Button></div></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DashboardBingkaiTabel>

    <Dialog v-model:open="tambahTerbuka">
      <DialogContent>
        <DialogHeader><DialogTitle>Tugaskan PIMPASA</DialogTitle><DialogDescription>Pegawai harus aktif dan berasal dari UPT yang membawahi desa tersebut.</DialogDescription></DialogHeader>
        <div class="grid gap-4">
          <label class="grid gap-1.5 text-sm font-medium">1. Desa binaan<NativeSelect v-model="inputBaru.desa_id" class="w-full"><NativeSelectOption value="">Pilih desa DBI</NativeSelectOption><NativeSelectOption v-for="item in opsi?.desa" :key="item.id" :value="item.id">{{ item.nama }}, {{ item.kecamatan }} · {{ item.kantor }}</NativeSelectOption></NativeSelect></label>
          <label class="grid gap-1.5 text-sm font-medium">2. Pegawai aktif<NativeSelect v-model="inputBaru.pegawai_id" class="w-full" :disabled="!inputBaru.desa_id"><NativeSelectOption value="">{{ inputBaru.desa_id ? 'Pilih pegawai' : 'Pilih desa terlebih dahulu' }}</NativeSelectOption><NativeSelectOption v-for="item in pegawaiTersaring" :key="item.id" :value="item.id">{{ item.nama }} · {{ item.kantor }}</NativeSelectOption></NativeSelect></label>
          <label class="grid gap-1.5 text-sm font-medium">3. Tanggal mulai<Input v-model="inputBaru.tanggal_mulai" type="date" :max="tanggalHariIniWib()" required /></label>
          <p v-if="pesan" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesan }}</p>
        </div>
        <DialogFooter><Button variant="outline" @click="tambahTerbuka = false">Batal</Button><Button :disabled="!inputBaru.desa_id || !inputBaru.pegawai_id || sedangSimpan" @click="simpanBaru">{{ sedangSimpan ? 'Menyimpan…' : 'Simpan penugasan' }}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog v-model:open="simpanDialog">
      <DialogContent>
        <DialogHeader><DialogTitle>{{ modeEdit === 'akhiri' ? 'Akhiri penugasan' : 'Koreksi tanggal penugasan' }}</DialogTitle><DialogDescription>Desa dan pegawai tidak dapat diganti; jika perlu, akhiri lalu buat penugasan baru.</DialogDescription></DialogHeader>
        <div class="grid gap-4">
          <div class="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm"><div><p class="flex items-center gap-1 text-xs text-muted-foreground"><Lock class="size-3" />Pegawai</p><p class="font-medium">{{ editItem?.pegawai }}</p></div><div><p class="flex items-center gap-1 text-xs text-muted-foreground"><Lock class="size-3" />Desa</p><p class="font-medium">{{ editItem?.desa }}</p></div></div>
          <label class="grid gap-1.5 text-sm font-medium">Tanggal mulai<Input v-model="inputTanggal.tanggal_mulai" type="date" required /></label>
          <template v-if="modeEdit === 'akhiri'">
            <label class="grid gap-1.5 text-sm font-medium">Tanggal selesai<Input v-model="inputTanggal.tanggal_selesai" type="date" :min="inputTanggal.tanggal_mulai" :max="tanggalHariIniWib()" required /></label>
            <label class="grid gap-1.5 text-sm font-medium">Alasan berakhir<NativeSelect v-model="inputTanggal.alasan_berakhir" class="w-full"><NativeSelectOption v-for="item in ALASAN_BERAKHIR_PENUGASAN.filter(item => item.value !== 'desa_dicabut')" :key="item.value" :value="item.value">{{ item.label }}</NativeSelectOption></NativeSelect></label>
          </template>
          <label v-else-if="editItem?.tanggal_selesai" class="grid gap-1.5 text-sm font-medium">Tanggal selesai<Input v-model="inputTanggal.tanggal_selesai" type="date" :min="inputTanggal.tanggal_mulai" /></label>
          <p v-if="pesan" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesan }}</p>
        </div>
        <DialogFooter><Button variant="outline" @click="simpanDialog = false">Batal</Button><Button :variant="modeEdit === 'akhiri' ? 'destructive' : 'default'" :disabled="sedangSimpan" @click="simpanPerubahan">{{ sedangSimpan ? 'Menyimpan…' : modeEdit === 'akhiri' ? 'Akhiri penugasan' : 'Simpan koreksi' }}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
