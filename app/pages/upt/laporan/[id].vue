<script setup lang="ts">
import { STATUS_LAPORAN } from '~~/shared/config/teks'
import type { Enums } from '~~/shared/types/database.types'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Textarea } from '~/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog'

definePageMeta({ layout: 'dashboard', title: 'Detail Laporan' })
const route = useRoute()
const { detail, ubahStatus } = useLaporanUpt()
const { daftarPegawai, pegawaiBertugasId } = useAuth()
const { data, pending, error, refresh } = await useAsyncData(`upt-laporan-${route.params.id}`, () => detail(String(route.params.id)))
const tujuan = ref<Enums<'status_laporan'> | ''>('')
const keterangan = ref('')
const menyimpan = ref(false)
const pesan = ref('')
const pesanSalin = ref('')
const namaPetugas = ref('')
const statusKini = computed(() => data.value?.status)
const final = computed(() => statusKini.value === 'selesai' || statusKini.value === 'ditolak')
const pilihan = computed<Enums<'status_laporan'>[]>(() => statusKini.value === 'diterima' ? ['diverifikasi', 'ditolak'] : statusKini.value === 'diverifikasi' ? ['ditindaklanjuti', 'ditolak'] : statusKini.value === 'ditindaklanjuti' ? ['selesai'] : [])
onMounted(async () => {
  if (!pegawaiBertugasId.value) return
  const daftar = await daftarPegawai().catch(() => [])
  namaPetugas.value = daftar.find(item => item.id === pegawaiBertugasId.value)?.nama ?? ''
})

async function salinKode() {
  if (!data.value) return
  try {
    await navigator.clipboard.writeText(data.value.kode_pelacakan)
    pesanSalin.value = 'Kode laporan disalin.'
  } catch {
    pesanSalin.value = 'Kode belum dapat disalin. Silakan salin secara manual.'
  }
}

async function simpanStatus() {
  if (!data.value || !tujuan.value || menyimpan.value) return
  if (['ditolak', 'selesai'].includes(tujuan.value) && !keterangan.value.trim()) { pesan.value = 'Keterangan wajib diisi untuk status ini.'; return }
  menyimpan.value = true; pesan.value = ''
  try { await ubahStatus(String(route.params.id), tujuan.value, keterangan.value); await refresh(); tujuan.value = ''; keterangan.value = ''; pesan.value = 'Status diperbarui.' }
  catch (galat) { pesan.value = pesanGalat(galat, 'Status belum dapat diperbarui.') }
  finally { menyimpan.value = false }
}
function simpan() {
  if (!['ditolak', 'selesai'].includes(tujuan.value)) void simpanStatus()
}
function konfirmasiFinal() {
  void simpanStatus()
}
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
    <p v-if="pending" class="rounded-xl border border-border bg-card p-6" role="status">Memuat detail laporan...</p>
    <div v-else-if="error" class="rounded-xl border border-border bg-card p-6" role="alert"><p>Laporan tidak ditemukan atau belum dapat dimuat.</p><NuxtLink class="mt-3 inline-block font-bold text-primary underline" to="/upt/laporan">Kembali ke daftar</NuxtLink></div>
    <template v-else-if="data">
      <section class="grid content-start gap-5 rounded-xl border border-border bg-card p-5 shadow-card sm:p-7">
        <header><div class="flex flex-wrap items-center gap-2"><p class="font-mono text-sm tracking-wider text-muted-foreground">{{ data.kode_pelacakan }}</p><Button variant="outline" size="sm" type="button" @click="salinKode">Salin kode</Button></div><p v-if="pesanSalin" class="mt-1 text-xs text-muted-foreground" role="status">{{ pesanSalin }}</p><div class="mt-2 flex flex-wrap items-center gap-3"><h2 class="text-2xl font-extrabold text-primary">Detail laporan</h2><StatusBadge :status="data.status" /></div><p class="mt-2 text-sm text-muted-foreground">Masuk {{ formatTanggalWaktuWib(data.created_at) }}</p></header>
        <dl class="grid gap-4 sm:grid-cols-2"><div><dt class="text-sm text-muted-foreground">Nama pelapor</dt><dd class="mt-1 font-semibold">{{ data.nama_pelapor }}</dd></div><div><dt class="text-sm text-muted-foreground">Alamat pelapor</dt><dd class="mt-1 font-semibold">{{ data.alamat_pelapor }}</dd></div><div><dt class="text-sm text-muted-foreground">Kantor yang menangani</dt><dd class="mt-1 font-semibold">{{ data.kantor || '—' }}</dd></div><div><dt class="text-sm text-muted-foreground">Lokasi kejadian</dt><dd class="mt-1 font-semibold">{{ [data.lokasi?.desa, data.lokasi?.kecamatan, data.lokasi?.kabupaten].filter(Boolean).join(', ') || 'Lokasi tidak tersedia' }}</dd></div><div><dt class="text-sm text-muted-foreground">Jenis terlapor</dt><dd class="mt-1 font-semibold">{{ data.jenis_terlapor.toUpperCase() }}</dd></div><div><dt class="text-sm text-muted-foreground">Lokasi pelapor</dt><dd class="mt-1"><a class="font-semibold text-primary underline" :href="`https://www.google.com/maps?q=${data.lintang},${data.bujur}`" target="_blank" rel="noopener noreferrer">Buka di peta</a></dd></div></dl>
        <div><h3 class="font-bold text-primary">Isi laporan</h3><p class="mt-2 whitespace-pre-wrap leading-7">{{ data.isi_laporan }}</p></div>
        <div v-if="data.laporan_sebelumnya_id"><h3 class="font-bold text-primary">Laporan lanjutan</h3><NuxtLink v-if="data.laporan_sebelumnya" class="mt-2 inline-block font-semibold text-primary underline" :to="`/upt/laporan/${data.laporan_sebelumnya.id}`">Laporan sebelumnya {{ data.laporan_sebelumnya.kode_pelacakan }}</NuxtLink><p v-else class="mt-2 text-sm text-muted-foreground">Laporan sebelumnya tidak dapat dibaca oleh kantor ini.</p></div>
        <div v-if="data.foto_url"><h3 class="font-bold text-primary">Foto pendukung</h3><a class="mt-2 inline-block" :href="data.foto_url" target="_blank" rel="noopener noreferrer"><img class="max-h-72 rounded-lg border border-border object-contain" :src="data.foto_url" alt="Foto pendukung laporan"></a></div>
      </section>
      <div class="grid content-start gap-6">
        <section class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-7"><h2 class="text-xl font-extrabold text-primary">Riwayat status</h2><ol class="mt-5 grid gap-4"><li v-for="item in data.riwayat_status" :key="item.id" class="rounded-lg bg-muted p-4"><TimelineStatus :timeline="[{ status: item.status, keterangan: item.keterangan, waktu: item.created_at }]" /><p v-if="item.nama_pegawai" class="mt-2 text-sm text-muted-foreground">Oleh {{ item.nama_pegawai }}</p></li></ol></section>
        <section class="rounded-xl border border-border bg-card p-5 shadow-card sm:p-7"><h2 class="text-xl font-extrabold text-primary">Ubah status</h2><p v-if="final" class="mt-3 text-muted-foreground">Laporan sudah final dan tidak dapat diubah.</p><form v-else class="mt-4 grid gap-3" @submit.prevent="simpan"><label class="grid gap-2 font-semibold" for="status-baru">Status baru<NativeSelect id="status-baru" v-model="tujuan" required><NativeSelectOption value="">Pilih status</NativeSelectOption><NativeSelectOption v-for="status in pilihan" :key="status" :value="status">{{ STATUS_LAPORAN.find(item => item.value === status)?.label }}</NativeSelectOption></NativeSelect></label><label class="grid gap-2 font-semibold" for="keterangan">Keterangan <span class="font-normal text-muted-foreground">(dapat dilihat oleh pelapor)</span><Textarea id="keterangan" v-model="keterangan" :required="['ditolak', 'selesai'].includes(tujuan)" maxlength="1000" rows="4" /></label><p class="text-right text-sm text-muted-foreground">{{ keterangan.length }}/1000</p><p class="text-xs text-muted-foreground">Jangan menuliskan identitas orang asing atau data sensitif.</p><p v-if="tujuan" class="text-sm text-muted-foreground">{{ STATUS_LAPORAN.find(item => item.value === tujuan)?.penjelasan }}</p><p v-if="namaPetugas" class="text-sm text-muted-foreground">Bertugas atas nama: <strong>{{ namaPetugas }}</strong> · <NuxtLink class="font-semibold text-primary underline" to="/upt/pilih-petugas">Ganti petugas</NuxtLink></p><Button v-if="tujuan !== 'ditolak' && tujuan !== 'selesai'" type="submit" :disabled="!tujuan || menyimpan">{{ menyimpan ? 'Menyimpan...' : 'Simpan status' }}</Button><AlertDialog v-else><AlertDialogTrigger as-child><Button type="button" variant="destructive" :disabled="menyimpan">Konfirmasi status final</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi status final</AlertDialogTitle><AlertDialogDescription>Status ini final dan tidak dapat diubah lagi. Lanjutkan?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction @click="konfirmasiFinal">Lanjutkan</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></form><p v-if="pesan" class="mt-3 text-sm" role="status">{{ pesan }}</p></section>
      </div>
    </template>
  </div>
</template>
