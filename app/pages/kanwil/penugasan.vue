<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { ALASAN_BERAKHIR_PENUGASAN } from '~~/shared/config/teks'
import { tanggalHariIniWib } from '~~/shared/utils/waktu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Skeleton } from '~/components/ui/skeleton'

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
function mulaiTambah() { inputBaru.desa_id = ''; inputBaru.pegawai_id = ''; inputBaru.tanggal_mulai = tanggalHariIniWib(); pesan.value = ''; tambahTerbuka.value = true }
watch(() => inputBaru.desa_id, () => { if (!pegawaiTersaring.value.some(item => item.id === inputBaru.pegawai_id)) inputBaru.pegawai_id = '' })
function mulaiUbah(item: (typeof data.value.data)[number], mode: 'koreksi' | 'akhiri') {
  editItem.value = item; modeEdit.value = mode; inputTanggal.tanggal_mulai = item.tanggal_mulai; inputTanggal.tanggal_selesai = tanggalHariIniWib(); inputTanggal.alasan_berakhir = 'rotasi'; pesan.value = ''; simpanDialog.value = true
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
    <header class="flex flex-wrap items-end justify-between gap-4"><div><h2 class="text-2xl font-semibold tracking-tight">Penugasan PIMPASA</h2><p class="mt-1 text-sm text-muted-foreground">Tugaskan pegawai aktif pada desa binaan dan jaga riwayatnya.</p></div><Button :disabled="opsiPending" @click="mulaiTambah">Tugaskan PIMPASA</Button></header>
    <Card><CardHeader><CardTitle>Daftar penugasan</CardTitle><CardDescription>Penugasan berakhir disimpan sebagai riwayat dan tidak dihapus.</CardDescription></CardHeader><CardContent><div class="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><label class="grid gap-1.5 text-sm font-medium">Status<NativeSelect v-model="status"><NativeSelectOption value="true">Berlaku</NativeSelectOption><NativeSelectOption value="false">Riwayat</NativeSelectOption><NativeSelectOption value="">Semua</NativeSelectOption></NativeSelect></label><label class="grid gap-1.5 text-sm font-medium">UPT<NativeSelect v-model="kantorId"><NativeSelectOption value="">Semua UPT</NativeSelectOption><NativeSelectOption v-for="item in data.kantor" :key="item.id" :value="item.id">{{ item.nama_singkat }}</NativeSelectOption></NativeSelect></label><label class="grid gap-1.5 text-sm font-medium">Desa binaan<NativeSelect v-model="desaIdFilter"><NativeSelectOption value="">Semua desa</NativeSelectOption><NativeSelectOption v-for="item in desaTersaring" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect></label><label class="grid gap-1.5 text-sm font-medium">Pegawai<NativeSelect v-model="pegawaiIdFilter"><NativeSelectOption value="">Semua pegawai</NativeSelectOption><NativeSelectOption v-for="item in filterPegawai" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect></label></div><div v-if="pending" class="grid gap-3"><Skeleton v-for="i in 5" :key="i" class="h-11 w-full" /></div><div v-else-if="error" class="grid gap-3 text-sm text-destructive" role="alert">Daftar penugasan belum dapat dimuat.<Button class="w-fit" variant="outline" @click="refresh()">Coba lagi</Button></div><Table v-else><TableHeader><TableRow><TableHead>Pegawai</TableHead><TableHead>UPT</TableHead><TableHead>Desa binaan</TableHead><TableHead>Sejak</TableHead><TableHead>Sampai</TableHead><TableHead>Alasan berakhir</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data.data" :key="item.id"><TableCell class="font-medium">{{ item.pegawai }}</TableCell><TableCell>{{ item.kantor }}</TableCell><TableCell>{{ item.desa }}</TableCell><TableCell>{{ item.tanggal_mulai }}</TableCell><TableCell>{{ item.tanggal_selesai ?? 'Berlaku' }}</TableCell><TableCell class="capitalize">{{ item.alasan_berakhir?.replace('_', ' ') ?? '—' }}</TableCell><TableCell><div class="flex gap-2"><Button size="sm" variant="outline" @click="mulaiUbah(item, 'koreksi')">Koreksi tanggal</Button><Button v-if="!item.tanggal_selesai" size="sm" variant="destructive" @click="mulaiUbah(item, 'akhiri')">Akhiri</Button></div></TableCell></TableRow><TableEmpty v-if="!data.data.length" :colspan="7">Belum ada penugasan untuk filter ini.</TableEmpty></TableBody></Table></CardContent></Card>
    <Dialog v-model:open="tambahTerbuka"><DialogContent><DialogHeader><DialogTitle>Tugaskan PIMPASA</DialogTitle><DialogDescription>Pegawai harus aktif dan berasal dari UPT yang melayani desa tersebut.</DialogDescription></DialogHeader><div class="grid gap-4"><label class="grid gap-2 text-sm font-medium">Desa binaan<NativeSelect v-model="inputBaru.desa_id"><NativeSelectOption value="">Pilih desa DBI</NativeSelectOption><NativeSelectOption v-for="item in opsi?.desa" :key="item.id" :value="item.id">{{ item.nama }}, {{ item.kecamatan }} · {{ item.kantor }}</NativeSelectOption></NativeSelect></label><label class="grid gap-2 text-sm font-medium">Pegawai aktif<NativeSelect v-model="inputBaru.pegawai_id" :disabled="!inputBaru.desa_id"><NativeSelectOption value="">Pilih pegawai</NativeSelectOption><NativeSelectOption v-for="item in pegawaiTersaring" :key="item.id" :value="item.id">{{ item.nama }} · {{ item.kantor }}</NativeSelectOption></NativeSelect></label><label class="grid gap-2 text-sm font-medium">Tanggal mulai<Input v-model="inputBaru.tanggal_mulai" type="date" :max="tanggalHariIniWib()" required /></label><p v-if="pesan" class="text-sm text-destructive" role="alert">{{ pesan }}</p></div><DialogFooter><Button variant="outline" @click="tambahTerbuka = false">Batal</Button><Button :disabled="!inputBaru.desa_id || !inputBaru.pegawai_id || sedangSimpan" @click="simpanBaru">{{ sedangSimpan ? 'Menyimpan…' : 'Simpan penugasan' }}</Button></DialogFooter></DialogContent></Dialog>
    <Dialog v-model:open="simpanDialog"><DialogContent><DialogHeader><DialogTitle>{{ modeEdit === 'akhiri' ? 'Akhiri penugasan' : 'Koreksi tanggal penugasan' }}</DialogTitle><DialogDescription>{{ editItem?.pegawai }} · {{ editItem?.desa }}. Desa dan pegawai tidak dapat diganti; jika perlu perubahan, akhiri lalu buat penugasan baru.</DialogDescription></DialogHeader><div class="grid gap-4"><label class="grid gap-2 text-sm font-medium">Tanggal mulai<Input v-model="inputTanggal.tanggal_mulai" type="date" required /></label><template v-if="modeEdit === 'akhiri'"><label class="grid gap-2 text-sm font-medium">Tanggal selesai<Input v-model="inputTanggal.tanggal_selesai" type="date" :min="inputTanggal.tanggal_mulai" :max="tanggalHariIniWib()" required /></label><label class="grid gap-2 text-sm font-medium">Alasan berakhir<NativeSelect v-model="inputTanggal.alasan_berakhir"><NativeSelectOption v-for="item in ALASAN_BERAKHIR_PENUGASAN.filter(item => item.value !== 'desa_dicabut')" :key="item.value" :value="item.value">{{ item.label }}</NativeSelectOption></NativeSelect></label></template><label v-else-if="editItem?.tanggal_selesai" class="grid gap-2 text-sm font-medium">Tanggal selesai<Input v-model="inputTanggal.tanggal_selesai" type="date" :min="inputTanggal.tanggal_mulai" /></label><p v-if="pesan" class="text-sm text-destructive" role="alert">{{ pesan }}</p></div><DialogFooter><Button variant="outline" @click="simpanDialog = false">Batal</Button><Button :disabled="sedangSimpan" @click="simpanPerubahan">{{ sedangSimpan ? 'Menyimpan…' : modeEdit === 'akhiri' ? 'Akhiri penugasan' : 'Simpan koreksi' }}</Button></DialogFooter></DialogContent></Dialog>
  </div>
</template>
