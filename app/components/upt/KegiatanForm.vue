<script setup lang="ts">
import { CalendarDays, FileText, ImagePlus, LoaderCircle, MapPin, Users } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { BATAS_FILE } from '~~/shared/config/batas-file'
import { tanggalHariIniWib } from '~~/shared/utils/waktu'
import { kompresFoto } from '~/utils/foto'

const props = withDefaults(defineProps<{
  id?: string
  desaIdAwal?: string
}>(), {
  id: '',
  desaIdAwal: ''
})

const emit = defineEmits<{ tersimpan: []; tutup: [] }>()
const { opsi, detail, buat, unggah, bersihkan, ubah } = useKegiatanUpt()
const { data: profilKantor } = await useProfilUpt()
const { pegawaiBertugasId } = useAuth()

const pilihan = ref<{
  desa: { desa_id: string; desa: string; kecamatan: string }[]
  pegawai: { id: string; nama: string }[]
  jenis: { id: string; nama: string }[]
  penugasan: { pegawai_id: string; desa_id: string; tanggal_mulai: string; tanggal_selesai: string | null }[]
}>({ desa: [], pegawai: [], jenis: [], penugasan: [] })
const isian = reactive({
  tanggal_kegiatan: tanggalHariIniWib(),
  desa_id: props.desaIdAwal,
  pegawai_id: '',
  jenis_kegiatan_id: '',
  jumlah_peserta: 0,
  uraian_hasil: '',
  foto_path: '',
  pdf_path: ''
})
const lampiranTersimpan = ref<{ foto_url: string | null; pdf_url: string | null }>({ foto_url: null, pdf_url: null })
const foto = ref<File>()
const pdf = ref<File>()
const pesan = ref('')
const memuat = ref(true)
const sibuk = ref(false)
const pratinjauFoto = ref('')
const progresFoto = ref<number | null>(null)
const progresPdf = ref<number | null>(null)

const modeUbah = computed(() => Boolean(props.id))
const pegawaiPengganti = computed(() => isian.desa_id && isian.pegawai_id && !pilihan.value.penugasan.some(item =>
  item.desa_id === isian.desa_id &&
  item.pegawai_id === isian.pegawai_id &&
  item.tanggal_mulai <= isian.tanggal_kegiatan &&
  (!item.tanggal_selesai || item.tanggal_selesai >= isian.tanggal_kegiatan)
))

onMounted(async () => {
  try {
    pilihan.value = await opsi()
    isian.pegawai_id = pilihan.value.pegawai.find(item => item.id === pegawaiBertugasId.value)?.id ?? pilihan.value.pegawai[0]?.id ?? ''
    if (props.id) {
      const kegiatan = await detail(props.id)
      Object.assign(isian, kegiatan)
      lampiranTersimpan.value = { foto_url: kegiatan.foto_url, pdf_url: kegiatan.pdf_url }
    }
  } catch {
    pesan.value = 'Pilihan form kegiatan belum dapat dimuat.'
  } finally {
    memuat.value = false
  }
})

onBeforeUnmount(() => {
  if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value)
})

async function pilihFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    foto.value = await kompresFoto(file)
    if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value)
    pratinjauFoto.value = URL.createObjectURL(foto.value)
    pesan.value = ''
  } catch (error) {
    foto.value = undefined
    pesan.value = error instanceof Error ? error.message : 'Foto belum dapat diproses.'
    input.value = ''
  }
}

function pilihPdf(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.type !== 'application/pdf' || file.size > BATAS_FILE.pdf.ukuranMaksimumByte) {
    pdf.value = undefined
    input.value = ''
    pesan.value = 'Laporan harus berformat PDF dan maksimal 8 MB.'
    return
  }
  pdf.value = file
  pesan.value = ''
}

async function simpan() {
  sibuk.value = true
  pesan.value = ''
  const unggahanBaru: { foto_path?: string; pdf_path?: string } = {}
  try {
    if (foto.value) {
      progresFoto.value = 0
      isian.foto_path = (await unggah(foto.value, 'foto', persen => progresFoto.value = persen)).path
      unggahanBaru.foto_path = isian.foto_path
    }
    if (pdf.value) {
      progresPdf.value = 0
      isian.pdf_path = (await unggah(pdf.value, 'pdf', persen => progresPdf.value = persen)).path
      unggahanBaru.pdf_path = isian.pdf_path
    }
    const payload = {
      tanggal_kegiatan: isian.tanggal_kegiatan,
      pegawai_id: isian.pegawai_id,
      jenis_kegiatan_id: isian.jenis_kegiatan_id,
      jumlah_peserta: isian.jumlah_peserta,
      uraian_hasil: isian.uraian_hasil,
      ...(isian.foto_path && { foto_path: isian.foto_path }),
      ...(isian.pdf_path && { pdf_path: isian.pdf_path })
    }
    if (props.id) await ubah(props.id, payload)
    else await buat({ ...payload, desa_id: isian.desa_id })
    toast.success(modeUbah.value ? 'Laporan kegiatan diperbarui.' : 'Laporan kegiatan tersimpan.')
    emit('tersimpan')
  } catch (error) {
    if (unggahanBaru.foto_path || unggahanBaru.pdf_path) await bersihkan(unggahanBaru).catch(() => undefined)
    pesan.value = (error as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Laporan belum dapat disimpan.'
  } finally {
    sibuk.value = false
    progresFoto.value = null
    progresPdf.value = null
  }
}
</script>

<template>
  <form class="grid gap-6" @submit.prevent="simpan">
    <div class="grid gap-3 border-b border-border pb-5">
      <p class="text-sm leading-6 text-muted-foreground">Kantor: <span class="font-medium text-foreground">{{ profilKantor?.kantor?.nama ?? 'Memuat kantor…' }}</span></p>
      <div v-if="memuat" class="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle class="size-4 animate-spin" />Memuat pilihan form…</div>
      <p v-else-if="pesan" class="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">{{ pesan }}</p>
    </div>

    <fieldset :disabled="memuat || sibuk" class="grid gap-6 disabled:opacity-60">
      <div class="grid gap-5 md:grid-cols-2">
        <label class="grid gap-2 text-sm font-semibold"><span class="flex items-center gap-2"><CalendarDays class="size-4 text-muted-foreground" />Tanggal kegiatan</span><Input v-model="isian.tanggal_kegiatan" class="h-11" type="date" :max="tanggalHariIniWib()" required /></label>
        <label class="grid gap-2 text-sm font-semibold"><span class="flex items-center gap-2"><Users class="size-4 text-muted-foreground" />Petugas</span><NativeSelect v-model="isian.pegawai_id" class="h-11" required><NativeSelectOption value="">Pilih petugas</NativeSelectOption><NativeSelectOption v-for="item in pilihan.pegawai" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect></label>
      </div>

      <label class="grid gap-2 text-sm font-semibold"><span class="flex items-center gap-2"><MapPin class="size-4 text-muted-foreground" />Desa binaan</span><NativeSelect v-model="isian.desa_id" class="h-11" required :disabled="modeUbah"><NativeSelectOption value="">Pilih desa binaan</NativeSelectOption><NativeSelectOption v-for="item in pilihan.desa" :key="item.desa_id" :value="item.desa_id">{{ item.desa }} — {{ item.kecamatan }}</NativeSelectOption></NativeSelect></label>

      <div v-if="pegawaiPengganti" class="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-200">Petugas ini bukan PIMPASA aktif pada desa dan tanggal yang dipilih. Sistem akan mencatatnya sebagai petugas pengganti.</div>

      <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_11rem]">
        <label class="grid gap-2 text-sm font-semibold"><span>Jenis kegiatan</span><NativeSelect v-model="isian.jenis_kegiatan_id" class="h-11" required><NativeSelectOption value="">Pilih jenis kegiatan</NativeSelectOption><NativeSelectOption v-for="item in pilihan.jenis" :key="item.id" :value="item.id">{{ item.nama }}</NativeSelectOption></NativeSelect></label>
        <label class="grid gap-2 text-sm font-semibold"><span>Jumlah peserta</span><Input v-model.number="isian.jumlah_peserta" class="h-11" type="number" min="0" max="100000" required /></label>
      </div>

      <label class="grid gap-2 text-sm font-semibold"><span>Uraian, hasil, dan tindak lanjut</span><Textarea v-model="isian.uraian_hasil" class="min-h-36 resize-y" minlength="10" maxlength="5000" required /><span class="text-right text-xs font-normal tabular-nums text-muted-foreground">{{ isian.uraian_hasil.length }}/5000</span></label>

      <div class="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
        <label class="grid gap-2 rounded-lg border border-dashed border-border bg-muted/35 p-4 text-sm font-semibold transition-colors hover:border-primary/45 hover:bg-muted/60"><span class="flex items-center gap-2"><ImagePlus class="size-4 text-primary" />Foto dokumentasi</span><span class="text-xs font-normal text-muted-foreground">JPEG, PNG, atau WebP · maks. 3 MB</span><input class="block w-full text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-3 file:py-2 file:font-medium file:text-foreground hover:file:bg-accent" type="file" accept="image/jpeg,image/png,image/webp" @change="pilihFoto"><Progress v-if="progresFoto !== null" :model-value="progresFoto" /></label>
        <label class="grid gap-2 rounded-lg border border-dashed border-border bg-muted/35 p-4 text-sm font-semibold transition-colors hover:border-primary/45 hover:bg-muted/60"><span class="flex items-center gap-2"><FileText class="size-4 text-primary" />Laporan PDF</span><span class="text-xs font-normal text-muted-foreground">PDF · maks. 8 MB</span><input class="block w-full text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-3 file:py-2 file:font-medium file:text-foreground hover:file:bg-accent" type="file" accept="application/pdf" @change="pilihPdf"><Progress v-if="progresPdf !== null" :model-value="progresPdf" /></label>
      </div>

      <div v-if="pratinjauFoto || lampiranTersimpan.foto_url || lampiranTersimpan.pdf_url || isian.pdf_path" class="flex flex-wrap items-center gap-3 text-sm"><img v-if="pratinjauFoto" :src="pratinjauFoto" class="size-16 rounded-md border object-cover" alt="Pratinjau foto kegiatan"><a v-if="lampiranTersimpan.foto_url && !pratinjauFoto" class="font-medium text-primary underline underline-offset-4" :href="lampiranTersimpan.foto_url" target="_blank" rel="noopener noreferrer">Lihat foto tersimpan</a><a v-if="lampiranTersimpan.pdf_url && !pdf" class="font-medium text-primary underline underline-offset-4" :href="lampiranTersimpan.pdf_url" target="_blank" rel="noopener noreferrer">Buka PDF tersimpan</a><span v-if="isian.pdf_path && !pdf && !lampiranTersimpan.pdf_url" class="text-muted-foreground">PDF tersimpan.</span></div>
    </fieldset>

    <div class="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" :disabled="sibuk" @click="emit('tutup')">Batal</Button>
      <Button type="submit" :disabled="memuat || sibuk">{{ sibuk ? 'Menyimpan…' : modeUbah ? 'Simpan perubahan' : 'Simpan laporan' }}</Button>
    </div>
  </form>
</template>
