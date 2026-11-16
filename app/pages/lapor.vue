<script setup lang="ts">
import { BATAS_WAKTU_GPS_MS, FORMAT_KODE_PELACAKAN, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'
import { JENIS_TERLAPOR, JENIS_WILAYAH_DESA, TEKS_LAPORAN_PUBLIK } from '~~/shared/config/teks'
import type { Enums } from '~~/shared/types/database.types'
import { kompresFoto } from '~/utils/foto'

definePageMeta({ layout: 'publik' })
useHead({ title: TEKS_LAPORAN_PUBLIK.judul })
const { kabupaten, kecamatan: ambilKecamatan, desa: ambilDesa, kantor: ambilKantor } = useWilayah()
const { kirimLaporan } = useLaporan()
const kabupatenId = ref('')
const kecamatanId = ref('')
const kecamatan = ambilKecamatan(kabupatenId)
const desa = ambilDesa(kecamatanId)
const kabupatenTerpilih = computed(() => kabupaten.data.value?.find(item => item.id === kabupatenId.value))
const kantor = ambilKantor(computed(() => kabupatenTerpilih.value?.kantor_id ?? undefined))
const koordinat = ref<{ lintang: number; bujur: number; akurasi: number }>()
const keadaanLokasi = ref<'menunggu' | 'meminta' | 'berhasil' | 'ditolak' | 'gps-mati' | 'timeout' | 'tidak-didukung'>('menunggu')
const sedangMengirim = ref(false)
const pesanError = ref('')
const foto = ref<File>()
const pratinjauFoto = ref('')
const kodePelacakan = ref('')
const waktuDiterima = ref('')
const sudahDisalin = ref(false)
const dialogSukses = ref<HTMLDialogElement>()
const isian = reactive({ nama_pelapor: '', alamat_pelapor: '', desa_kelurahan_id: '', jenis_terlapor: '' as string, isi_laporan: '', kode_laporan_sebelumnya: '' })
const aktifkanForm = computed(() => keadaanLokasi.value === 'berhasil' && Boolean(koordinat.value) && !sedangMengirim.value)
const valid = computed(() => isian.nama_pelapor.trim().length > 0 && isian.nama_pelapor.length <= 150 && isian.alamat_pelapor.trim().length > 0 && isian.alamat_pelapor.length <= 500 && Boolean(kabupatenId.value && kecamatanId.value && isian.desa_kelurahan_id && isian.jenis_terlapor) && isian.isi_laporan.trim().length >= 10 && isian.isi_laporan.length <= 5000)

watch(kabupatenId, () => { kecamatanId.value = ''; isian.desa_kelurahan_id = '' })
watch(kecamatanId, () => { isian.desa_kelurahan_id = '' })
onMounted(async () => {
  if (!window.isSecureContext || !navigator.geolocation) {
    keadaanLokasi.value = 'tidak-didukung'
    return
  }
  try {
    const izin = await navigator.permissions?.query({ name: 'geolocation' })
    if (izin?.state === 'granted') await dapatkanLokasi()
  } catch {
    // Browser tanpa Permissions API meminta lokasi hanya setelah tombol ditekan.
  }
})
onBeforeUnmount(() => { if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value) })

function labelWilayah(value: Enums<'jenis_wilayah_desa'>) { return JENIS_WILAYAH_DESA.find(item => item.value === value)?.label ?? value }
function dapatkanLokasi() {
  keadaanLokasi.value = 'meminta'
  navigator.geolocation.getCurrentPosition((posisi) => {
    koordinat.value = { lintang: posisi.coords.latitude, bujur: posisi.coords.longitude, akurasi: posisi.coords.accuracy }
    keadaanLokasi.value = 'berhasil'
  }, (galat) => {
    keadaanLokasi.value = galat.code === galat.PERMISSION_DENIED ? 'ditolak' : galat.code === galat.POSITION_UNAVAILABLE ? 'gps-mati' : 'timeout'
  }, { enableHighAccuracy: true, timeout: BATAS_WAKTU_GPS_MS, maximumAge: 0 })
}

async function pilihFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    foto.value = await kompresFoto(file)
    if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value)
    pratinjauFoto.value = URL.createObjectURL(foto.value)
    pesanError.value = ''
  } catch (galat) { foto.value = undefined; pesanError.value = galat instanceof Error ? galat.message : TEKS_LAPORAN_PUBLIK.fotoDitolak; input.value = '' }
}
function hapusFoto() { foto.value = undefined; if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value); pratinjauFoto.value = '' }

async function kirim() {
  if (!aktifkanForm.value || !valid.value || !koordinat.value) return
  sedangMengirim.value = true; pesanError.value = ''
  const form = new FormData()
  for (const [kunci, nilai] of Object.entries(isian)) form.append(kunci, nilai)
  form.append('lintang', String(koordinat.value.lintang)); form.append('bujur', String(koordinat.value.bujur)); form.append('akurasi_meter', String(koordinat.value.akurasi))
  if (foto.value) form.append('foto', foto.value)
  try {
    const hasil = await kirimLaporan(form)
    kodePelacakan.value = hasil.kode_pelacakan; waktuDiterima.value = new Date().toISOString(); sudahDisalin.value = false; dialogSukses.value?.showModal()
  } catch (galat) {
    const status = galat && typeof galat === 'object' && 'statusCode' in galat ? Number((galat as { statusCode?: number }).statusCode) : 0
    const message = galat && typeof galat === 'object' && 'data' in galat ? String((galat as { data?: { statusMessage?: string } }).data?.statusMessage ?? '') : ''
    pesanError.value = status === 422 ? TEKS_LAPORAN_PUBLIK.lokasiDiLuarRiau : status === 429 ? TEKS_LAPORAN_PUBLIK.terlaluBanyak : status === 404 ? TEKS_LAPORAN_PUBLIK.kodeSebelumnyaTidakAda : message.includes('foto') || message.includes('Foto') ? TEKS_LAPORAN_PUBLIK.fotoDitolak : message.includes('Desa') || message.includes('desa') ? TEKS_LAPORAN_PUBLIK.desaTidakValid : TEKS_LAPORAN_PUBLIK.gagalKirim
  } finally { sedangMengirim.value = false }
}
async function salinKode() { try { await navigator.clipboard.writeText(kodePelacakan.value); sudahDisalin.value = true } catch { sudahDisalin.value = false } }
function tutupSukses(event?: Event) {
  if (event) event.preventDefault()
  if (!sudahDisalin.value && !window.confirm(TEKS_LAPORAN_PUBLIK.konfirmasiTutup)) return
  dialogSukses.value?.close(); kodePelacakan.value = ''; Object.assign(isian, { nama_pelapor: '', alamat_pelapor: '', desa_kelurahan_id: '', jenis_terlapor: '', isi_laporan: '', kode_laporan_sebelumnya: '' }); kabupatenId.value = ''; kecamatanId.value = ''; hapusFoto()
}
</script>

<template>
  <main class="mx-auto min-h-[70vh] max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
    <header class="mb-6"><h1 class="text-4xl font-black tracking-tight text-primary">{{ TEKS_LAPORAN_PUBLIK.judul }}</h1><p class="mt-2 text-muted-foreground">{{ REGIONAL_OFFICE_NAME }}</p></header>
    <section class="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7" aria-labelledby="judul-lokasi">
      <h2 id="judul-lokasi" class="text-xl font-extrabold text-primary">{{ keadaanLokasi === 'berhasil' ? TEKS_LAPORAN_PUBLIK.lokasiTerdeteksi : TEKS_LAPORAN_PUBLIK.tungguLokasi }}</h2>
      <p v-if="keadaanLokasi === 'berhasil'" class="mt-2 font-semibold text-green-700" role="status">{{ TEKS_LAPORAN_PUBLIK.lokasiTerdeteksi }}</p>
      <p v-else-if="keadaanLokasi === 'meminta'" class="mt-2 text-muted-foreground" role="status">{{ TEKS_LAPORAN_PUBLIK.memintaLokasi }}</p>
      <p v-else-if="keadaanLokasi !== 'menunggu'" class="mt-2 text-destructive" role="alert">{{ keadaanLokasi === 'ditolak' ? TEKS_LAPORAN_PUBLIK.izinDitolak : keadaanLokasi === 'gps-mati' ? TEKS_LAPORAN_PUBLIK.gpsMati : keadaanLokasi === 'timeout' ? TEKS_LAPORAN_PUBLIK.gpsTimeout : TEKS_LAPORAN_PUBLIK.gpsTidakDidukung }}</p>
      <button v-if="keadaanLokasi !== 'berhasil' && keadaanLokasi !== 'tidak-didukung'" class="mt-4 min-h-11 rounded-lg bg-secondary px-4 font-bold text-white disabled:opacity-60" type="button" :disabled="keadaanLokasi === 'meminta'" @click="dapatkanLokasi">{{ keadaanLokasi === 'ditolak' || keadaanLokasi === 'gps-mati' || keadaanLokasi === 'timeout' ? TEKS_LAPORAN_PUBLIK.cobaLagi : keadaanLokasi === 'meminta' ? TEKS_LAPORAN_PUBLIK.memintaLokasi : TEKS_LAPORAN_PUBLIK.izinkanLokasi }}</button>
    </section>
    <form class="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8" @submit.prevent="kirim">
      <fieldset class="grid gap-3 disabled:opacity-60" :disabled="!aktifkanForm">
        <legend class="mb-3 text-xl font-extrabold text-primary">Informasi laporan</legend>
        <label class="mt-2 font-semibold" for="nama">{{ TEKS_LAPORAN_PUBLIK.nama }}</label><input id="nama" v-model="isian.nama_pelapor" class="min-h-11 rounded-lg border border-border bg-background px-3 text-base" maxlength="150" required autocomplete="name">
        <label class="mt-2 font-semibold" for="kabupaten">{{ TEKS_LAPORAN_PUBLIK.kabupaten }}</label><select id="kabupaten" v-model="kabupatenId" class="min-h-11 rounded-lg border border-border bg-background px-3 text-base" required><option value="">Pilih kabupaten/kota</option><option v-for="item in kabupaten.data.value" :key="item.id" :value="item.id">{{ item.nama }}</option></select>
        <p v-if="kabupaten.pending.value" class="text-sm text-muted-foreground" role="status">Memuat kabupaten/kota...</p><p v-else-if="kabupaten.error.value" class="text-sm text-destructive" role="alert">Kabupaten/kota belum dapat dimuat.</p><p v-else-if="!kabupaten.data.value?.length" class="text-sm text-muted-foreground">Data kabupaten/kota belum tersedia.</p>
        <label class="mt-2 font-semibold" for="kecamatan">{{ TEKS_LAPORAN_PUBLIK.kecamatan }}</label><select id="kecamatan" v-model="kecamatanId" class="min-h-11 rounded-lg border border-border bg-background px-3 text-base" required :disabled="!kabupatenId"><option value="">Pilih kecamatan</option><option v-for="item in kecamatan.data.value" :key="item.id" :value="item.id">{{ item.nama }}</option></select>
        <p v-if="kecamatan.pending.value" class="text-sm text-muted-foreground" role="status">Memuat kecamatan...</p><p v-else-if="kecamatan.error.value" class="text-sm text-destructive" role="alert">Kecamatan belum dapat dimuat.</p>
        <label class="mt-2 font-semibold" for="desa">{{ TEKS_LAPORAN_PUBLIK.desa }}</label><select id="desa" v-model="isian.desa_kelurahan_id" class="min-h-11 rounded-lg border border-border bg-background px-3 text-base" required :disabled="!kecamatanId"><option value="">Pilih desa/kelurahan</option><option v-for="item in desa.data.value" :key="item.id" :value="item.id">{{ item.nama }} ({{ labelWilayah(item.jenis_wilayah) }})</option></select><p v-if="desa.pending.value" class="text-sm text-muted-foreground" role="status">Memuat desa/kelurahan...</p><p v-else-if="desa.error.value" class="text-sm text-destructive" role="alert">Desa/kelurahan belum dapat dimuat.</p>
        <p v-if="kantor.data.value?.nama" class="rounded-lg bg-muted p-3 text-sm">{{ TEKS_LAPORAN_PUBLIK.kantor }} <strong>{{ kantor.data.value.nama.toLocaleUpperCase('id') }}</strong></p>
        <label class="mt-2 font-semibold" for="alamat">{{ TEKS_LAPORAN_PUBLIK.alamat }}</label><textarea id="alamat" v-model="isian.alamat_pelapor" class="rounded-lg border border-border bg-background px-3 py-2 text-base" maxlength="500" required rows="3" />
        <label class="mt-2 font-semibold" for="jenis">{{ TEKS_LAPORAN_PUBLIK.jenisTerlapor }}</label><select id="jenis" v-model="isian.jenis_terlapor" class="min-h-11 rounded-lg border border-border bg-background px-3 text-base" required><option value="">Pilih jenis terlapor</option><option v-for="item in JENIS_TERLAPOR" :key="item.value" :value="item.value">{{ item.label }}</option></select>
        <label class="mt-2 font-semibold" for="isi">{{ TEKS_LAPORAN_PUBLIK.isi }}</label><textarea id="isi" v-model="isian.isi_laporan" class="rounded-lg border border-border bg-background px-3 py-2 text-base" minlength="10" maxlength="5000" required rows="8" /><p class="text-right text-sm text-muted-foreground">{{ isian.isi_laporan.length }}/5000</p>
        <label class="mt-2 font-semibold" for="foto">{{ TEKS_LAPORAN_PUBLIK.foto }}</label><input id="foto" class="rounded-lg border border-border p-2 text-base file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2" type="file" accept="image/jpeg,image/png,image/webp" @change="pilihFoto"><div v-if="pratinjauFoto" class="flex items-center gap-4"><img class="size-20 rounded-lg object-cover" :src="pratinjauFoto" alt="Pratinjau foto pendukung"><button class="min-h-10 text-sm font-bold text-destructive underline" type="button" @click="hapusFoto">{{ TEKS_LAPORAN_PUBLIK.hapusFoto }}</button></div>
        <details class="mt-3 rounded-lg border border-border p-4"><summary class="cursor-pointer font-semibold">{{ TEKS_LAPORAN_PUBLIK.tindakLanjut }}</summary><label class="mt-4 grid gap-2 font-semibold" for="kode-sebelumnya">{{ TEKS_LAPORAN_PUBLIK.kodeSebelumnya }}<input id="kode-sebelumnya" v-model="isian.kode_laporan_sebelumnya" class="min-h-11 rounded-lg border border-border bg-background px-3 font-mono text-base" :placeholder="FORMAT_KODE_PELACAKAN" autocomplete="off"></label></details>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ TEKS_LAPORAN_PUBLIK.bantuanPrivasi }} <NuxtLink class="font-semibold text-primary underline" to="/privasi">Privasi</NuxtLink></p>
        <button class="mt-3 min-h-12 rounded-lg bg-primary px-5 font-bold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50" type="submit" :disabled="!aktifkanForm || !valid">{{ sedangMengirim ? TEKS_LAPORAN_PUBLIK.mengirim : TEKS_LAPORAN_PUBLIK.kirim }}</button>
      </fieldset>
      <p v-if="pesanError" class="mt-4 rounded-lg bg-background p-3 text-destructive" role="alert">{{ pesanError }}</p>
    </form>
    <dialog ref="dialogSukses" class="w-[min(42rem,calc(100%-2rem))] rounded-2xl border border-border bg-card p-0 text-foreground shadow-card backdrop:bg-black/50" @cancel="tutupSukses">
      <section class="p-6 sm:p-8"><h2 class="text-2xl font-black text-primary">{{ TEKS_LAPORAN_PUBLIK.sukses }}</h2><p class="mt-2 text-muted-foreground">{{ TEKS_LAPORAN_PUBLIK.simpanKode }}</p><div class="mt-4 flex flex-wrap items-center gap-3"><strong class="rounded-lg bg-muted px-4 py-3 font-mono text-xl tracking-wider text-primary">{{ kodePelacakan }}</strong><button class="min-h-11 rounded-lg border border-border px-4 font-bold text-primary" type="button" @click="salinKode">{{ sudahDisalin ? TEKS_LAPORAN_PUBLIK.tersalin : TEKS_LAPORAN_PUBLIK.salinKode }}</button></div><h3 class="mt-7 font-bold text-primary">Riwayat status</h3><TimelineStatus class="mt-4" :timeline="[{ status: 'diterima', waktu: waktuDiterima }]" /><div class="mt-6 flex flex-wrap gap-3"><NuxtLink class="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 font-bold text-accent-foreground no-underline" :to="`/lacak?kode=${encodeURIComponent(kodePelacakan)}`">{{ TEKS_LAPORAN_PUBLIK.cekStatus }}</NuxtLink><button class="min-h-11 rounded-lg border border-border px-4 font-bold" type="button" @click="tutupSukses()">{{ TEKS_LAPORAN_PUBLIK.tutup }}</button></div></section>
    </dialog>
  </main>
</template>
