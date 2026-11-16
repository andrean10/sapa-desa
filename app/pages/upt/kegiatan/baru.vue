<script setup lang="ts">
import { toast } from 'vue-sonner'
import { tanggalHariIniWib } from '~~/shared/utils/waktu'
import { BATAS_FILE } from '~~/shared/config/batas-file'
import { kompresFoto } from '~/utils/foto'
definePageMeta({ layout: 'dashboard', title: 'Buat Laporan Kegiatan' })
const route = useRoute()
const id = typeof route.params.id === 'string' ? route.params.id : typeof route.query.id === 'string' ? route.query.id : ''
const { opsi, detail, buat, unggah, bersihkan, ubah } = useKegiatanUpt()
const { data: profilKantor } = await useProfilUpt()
const { pegawaiBertugasId } = useAuth()
const pilihan = ref<{ desa: { desa_id: string; desa: string; kecamatan: string }[]; pegawai: { id: string; nama: string }[]; jenis: { id: string; nama: string }[]; penugasan: { pegawai_id: string; desa_id: string; tanggal_mulai: string; tanggal_selesai: string | null }[] }>({ desa: [], pegawai: [], jenis: [], penugasan: [] })
const isian = reactive({ tanggal_kegiatan: tanggalHariIniWib(), desa_id: String(route.query.desa ?? ''), pegawai_id: '', jenis_kegiatan_id: '', jumlah_peserta: 0, uraian_hasil: '', foto_path: '', pdf_path: '' })
const lampiranTersimpan = ref<{ foto_url: string | null; pdf_url: string | null }>({ foto_url: null, pdf_url: null })
const foto = ref<File>()
const pdf = ref<File>()
const pesan = ref('')
const sibuk = ref(false)
const pratinjauFoto = ref('')
const progresFoto = ref<number | null>(null)
const progresPdf = ref<number | null>(null)
const pegawaiPengganti = computed(() => isian.desa_id && isian.pegawai_id && !pilihan.value.penugasan.some(item => item.desa_id === isian.desa_id && item.pegawai_id === isian.pegawai_id && item.tanggal_mulai <= isian.tanggal_kegiatan && (!item.tanggal_selesai || item.tanggal_selesai >= isian.tanggal_kegiatan)))
onMounted(async () => { try { pilihan.value = await opsi(); isian.pegawai_id = pilihan.value.pegawai.find(item => item.id === pegawaiBertugasId.value)?.id ?? pilihan.value.pegawai[0]?.id ?? ''; if (id) { const kegiatan = await detail(id); Object.assign(isian, kegiatan); lampiranTersimpan.value = { foto_url: kegiatan.foto_url, pdf_url: kegiatan.pdf_url } } } catch { pesan.value = 'Pilihan atau data kegiatan belum dapat dimuat.' } })
onBeforeUnmount(() => { if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value) })
async function pilihFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    foto.value = await kompresFoto(file)
    if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value)
    pratinjauFoto.value = URL.createObjectURL(foto.value)
    pesan.value = ''
  } catch (error) { foto.value = undefined; pesan.value = error instanceof Error ? error.message : 'Foto belum dapat diproses.'; input.value = '' }
}
function pilihPdf(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.type !== 'application/pdf' || file.size > BATAS_FILE.pdf.ukuranMaksimumByte) {
    pdf.value = undefined; input.value = ''; pesan.value = 'Laporan harus berformat PDF dan maksimal 8 MB.'; return
  }
  pdf.value = file; pesan.value = ''
}
async function simpan() {
  sibuk.value = true; pesan.value = ''
  const unggahanBaru: { foto_path?: string; pdf_path?: string } = {}
  try {
    if (foto.value) { progresFoto.value = 0; isian.foto_path = (await unggah(foto.value, 'foto', persen => progresFoto.value = persen)).path; unggahanBaru.foto_path = isian.foto_path }
    if (pdf.value) { progresPdf.value = 0; isian.pdf_path = (await unggah(pdf.value, 'pdf', persen => progresPdf.value = persen)).path; unggahanBaru.pdf_path = isian.pdf_path }
    const payload = {
      tanggal_kegiatan: isian.tanggal_kegiatan,
      pegawai_id: isian.pegawai_id,
      jenis_kegiatan_id: isian.jenis_kegiatan_id,
      jumlah_peserta: isian.jumlah_peserta,
      uraian_hasil: isian.uraian_hasil,
      ...(isian.foto_path && { foto_path: isian.foto_path }),
      ...(isian.pdf_path && { pdf_path: isian.pdf_path })
    }
    if (id) await ubah(id, payload)
    else await buat({ ...payload, desa_id: isian.desa_id })
    toast.success(id ? 'Laporan kegiatan diperbarui.' : 'Laporan kegiatan tersimpan.')
    await navigateTo('/upt/kegiatan')
  }
  catch (error) {
    if (unggahanBaru.foto_path || unggahanBaru.pdf_path) await bersihkan(unggahanBaru).catch(() => undefined)
    pesan.value = (error as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Laporan belum dapat disimpan.'
  }
  finally { sibuk.value = false; progresFoto.value = null; progresPdf.value = null }
}
</script>

<template>
  <section class="mx-auto max-w-3xl rounded-xl border border-border bg-card p-5 shadow-card sm:p-8"><h2 class="text-2xl font-extrabold text-primary">{{ id ? 'Ubah Laporan Kegiatan' : 'Buat Laporan Kegiatan PIMPASA' }}</h2><p class="mt-2 text-sm text-muted-foreground">Kantor: {{ profilKantor?.kantor?.nama ?? "Memuat profil kantor..." }}</p><form class="mt-5 grid gap-4" @submit.prevent="simpan"><label class="grid gap-2 font-semibold">Tanggal kegiatan<Input v-model="isian.tanggal_kegiatan" class="min-h-11 rounded-lg border border-border bg-background px-3" type="date" :max="tanggalHariIniWib()" required /></label><label class="grid gap-2 font-semibold">Desa binaan<NativeSelect v-model="isian.desa_id" class="min-h-11 rounded-lg border border-border bg-background px-3" required :disabled="Boolean(id)"><option value="">Pilih desa binaan</option><option v-for="item in pilihan.desa" :key="item.desa_id" :value="item.desa_id">{{ item.desa }} — {{ item.kecamatan }}</option></NativeSelect></label><label class="grid gap-2 font-semibold">Petugas<NativeSelect v-model="isian.pegawai_id" class="min-h-11 rounded-lg border border-border bg-background px-3" required><option value="">Pilih pegawai</option><option v-for="item in pilihan.pegawai" :key="item.id" :value="item.id">{{ item.nama }}</option></NativeSelect><span v-if="pegawaiPengganti" class="text-sm font-semibold text-accent-foreground">Petugas ini bukan PIMPASA aktif desa tersebut pada tanggal kegiatan. Database akan menandai sebagai petugas pengganti.</span></label><label class="grid gap-2 font-semibold">Jenis kegiatan<NativeSelect v-model="isian.jenis_kegiatan_id" class="min-h-11 rounded-lg border border-border bg-background px-3" required><option value="">Pilih jenis kegiatan</option><option v-for="item in pilihan.jenis" :key="item.id" :value="item.id">{{ item.nama }}</option></NativeSelect></label><label class="grid gap-2 font-semibold">Jumlah peserta<Input v-model.number="isian.jumlah_peserta" class="min-h-11 rounded-lg border border-border bg-background px-3" type="number" min="0" max="100000" required /></label><label class="grid gap-2 font-semibold">Uraian, hasil, dan tindak lanjut<Textarea v-model="isian.uraian_hasil" class="rounded-lg border border-border bg-background px-3 py-2" minlength="10" maxlength="5000" rows="7" required /><span class="text-right text-sm font-normal text-muted-foreground">{{ isian.uraian_hasil.length }}/5000</span></label><label class="grid gap-2 font-semibold">Foto dokumentasi (maks 3 MB)<input class="rounded-lg border border-border p-2 text-base" type="file" accept="image/jpeg,image/png,image/webp" @change="pilihFoto"></label><label class="grid gap-2 font-semibold">Laporan PDF (maks 8 MB)<input class="rounded-lg border border-border p-2 text-base" type="file" accept="application/pdf" @change="pilihPdf"></label><a v-if="lampiranTersimpan.foto_url && !pratinjauFoto" class="text-sm font-semibold text-primary underline" :href="lampiranTersimpan.foto_url" target="_blank" rel="noopener noreferrer">Lihat foto yang tersimpan</a><a v-if="lampiranTersimpan.pdf_url && !pdf" class="text-sm font-semibold text-primary underline" :href="lampiranTersimpan.pdf_url" target="_blank" rel="noopener noreferrer">Buka PDF yang tersimpan</a><img v-if="pratinjauFoto" :src="pratinjauFoto" class="max-h-64 rounded-lg border border-border object-contain" alt="Pratinjau foto kegiatan"><p v-else-if="isian.foto_path" class="text-sm text-muted-foreground">Foto tersimpan. Unggah foto baru untuk menggantinya.</p><p v-if="isian.pdf_path && !pdf" class="text-sm text-muted-foreground">PDF tersimpan. Unggah PDF baru untuk menggantinya.</p><p v-if="pesan" class="text-destructive" role="alert">{{ pesan }}</p><Button class="min-h-11 rounded-lg bg-primary px-4 font-bold text-white disabled:opacity-50" type="submit" :disabled="sibuk">{{ sibuk ? 'Menyimpan...' : 'Simpan laporan' }}</Button></form></section>
</template>
