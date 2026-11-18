<script setup lang="ts">
import { BATAS_WAKTU_GPS_MS, FORMAT_KODE_PELACAKAN } from '~~/shared/config/app'
import { BATAS_FILE } from '~~/shared/config/batas-file'
import { JENIS_TERLAPOR, JENIS_WILAYAH_DESA, TEKS_LAPORAN_PUBLIK } from '~~/shared/config/teks'
import type { Enums } from '~~/shared/types/database.types'
import PublicSelect from '~/components/public/PublicSelect.vue'
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
const dialogLokasi = ref<HTMLDialogElement>()
const inputFoto = ref<HTMLInputElement>()
const isian = reactive({ nama_pelapor: '', alamat_pelapor: '', desa_kelurahan_id: '', jenis_terlapor: '' as string, isi_laporan: '', kode_laporan_sebelumnya: '' })
const aktifkanForm = computed(() => keadaanLokasi.value === 'berhasil' && Boolean(koordinat.value) && !sedangMengirim.value)
const valid = computed(() => isian.nama_pelapor.trim().length > 0 && isian.nama_pelapor.length <= 150 && isian.alamat_pelapor.trim().length > 0 && isian.alamat_pelapor.length <= 500 && Boolean(kabupatenId.value && kecamatanId.value && isian.desa_kelurahan_id && isian.jenis_terlapor) && isian.isi_laporan.trim().length >= 10 && isian.isi_laporan.length <= 5000)
const opsiKabupaten = computed(() => kabupaten.data.value?.map(item => ({ value: item.id, label: item.nama })) ?? [])
const opsiKecamatan = computed(() => kecamatan.data.value?.map(item => ({ value: item.id, label: item.nama })) ?? [])
const opsiDesa = computed(() => desa.data.value?.map(item => ({ value: item.id, label: `${item.nama} (${labelWilayah(item.jenis_wilayah)})` })) ?? [])
const opsiJenisTerlapor = JENIS_TERLAPOR.map(item => ({ value: item.value, label: item.label }))

watch(kabupatenId, () => { kecamatanId.value = ''; isian.desa_kelurahan_id = '' })
watch(kecamatanId, () => { isian.desa_kelurahan_id = '' })
onMounted(async () => {
  dialogLokasi.value?.showModal()
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
    dialogLokasi.value?.close()
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
function hapusFoto() {
  foto.value = undefined
  if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value)
  pratinjauFoto.value = ''
  // Kosongkan input agar memilih file yang sama lagi tetap memicu event change.
  if (inputFoto.value) inputFoto.value.value = ''
}
function ukuranFoto(byte = 0) {
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} KB`
  return `${(byte / 1024 / 1024).toFixed(1)} MB`
}

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
    pesanError.value = pesanKirimGagal(galat)
  } finally { sedangMengirim.value = false }
}
/** Menerjemahkan error dari /api/publik/laporan menjadi teks ramah untuk pelapor. */
function pesanKirimGagal(galat: unknown) {
  const status = Number((galat as { statusCode?: number } | null)?.statusCode ?? 0)
  const pesanServer = pesanGalat(galat, '')
  if (status === 429) return TEKS_LAPORAN_PUBLIK.terlaluBanyak
  if (status === 404) return TEKS_LAPORAN_PUBLIK.kodeSebelumnyaTidakAda
  // Cek desa lebih dulu: server memakai status 422 untuk "desa tidak valid" DAN "lokasi di luar Riau".
  if (pesanServer.includes('Desa/kelurahan')) return TEKS_LAPORAN_PUBLIK.desaTidakValid
  if (status === 422) return TEKS_LAPORAN_PUBLIK.lokasiDiLuarRiau
  if (status === 413 || status === 415 || /foto/i.test(pesanServer)) return TEKS_LAPORAN_PUBLIK.fotoDitolak
  if (pesanServer.includes('Kode laporan sebelumnya')) return TEKS_LAPORAN_PUBLIK.kodeSebelumnyaTidakAda
  return TEKS_LAPORAN_PUBLIK.gagalKirim
}
async function salinKode() { try { await navigator.clipboard.writeText(kodePelacakan.value); sudahDisalin.value = true } catch { sudahDisalin.value = false } }
function tutupSukses(event?: Event) {
  if (event) event.preventDefault()
  if (!sudahDisalin.value && !window.confirm(TEKS_LAPORAN_PUBLIK.konfirmasiTutup)) return
  dialogSukses.value?.close(); kodePelacakan.value = ''; Object.assign(isian, { nama_pelapor: '', alamat_pelapor: '', desa_kelurahan_id: '', jenis_terlapor: '', isi_laporan: '', kode_laporan_sebelumnya: '' }); kabupatenId.value = ''; kecamatanId.value = ''; hapusFoto()
}
function tutupLokasi() { dialogLokasi.value?.close() }
function bukaLokasi() { if (!dialogLokasi.value?.open) dialogLokasi.value?.showModal() }
</script>

<template>
  <main>
    <section class="bg-primary text-primary-foreground">
      <div class="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <p class="text-xs font-extrabold uppercase tracking-[.18em] text-accent">Aduan Masyarakat</p>
        <h1 class="mt-5 max-w-3xl text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl">{{ TEKS_LAPORAN_PUBLIK.judul }}</h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-white/75">Sampaikan informasi yang Anda lihat. Aduan diteruskan ke kantor imigrasi yang menangani wilayah tersebut.</p>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20">
      <div class="mx-auto max-w-3xl">
        <form class="min-w-0 w-full bg-card p-6 shadow-card sm:p-10" @submit.prevent="kirim">
          <div v-if="keadaanLokasi !== 'berhasil'" class="mb-6 flex flex-wrap items-center gap-3 bg-muted p-4 text-sm" role="status">
            <span class="min-w-0 flex-1 font-semibold text-primary">{{ TEKS_LAPORAN_PUBLIK.formulirMenungguLokasi }}</span>
            <button class="min-h-10 rounded-xl bg-primary px-4 font-bold text-primary-foreground transition hover:bg-secondary" type="button" @click="bukaLokasi">{{ TEKS_LAPORAN_PUBLIK.bukaPengaturanLokasi }}</button>
          </div>
          <fieldset class="grid min-w-0 w-full gap-6 disabled:opacity-60" :disabled="!aktifkanForm">
            <legend class="text-2xl font-extrabold text-primary">Informasi aduan</legend>
            <div class="grid min-w-0 w-full gap-6 sm:grid-cols-2">
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary sm:col-span-2" for="nama"><span>{{ TEKS_LAPORAN_PUBLIK.nama }}</span><input id="nama" v-model="isian.nama_pelapor" class="min-h-12 w-full min-w-0 rounded-xl border border-input bg-background px-4 text-base font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary" maxlength="150" required autocomplete="name"></label>
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary" for="kabupaten"><span>{{ TEKS_LAPORAN_PUBLIK.kabupaten }}</span><PublicSelect id="kabupaten" v-model="kabupatenId" placeholder="Pilih kabupaten/kota" :options="opsiKabupaten" :disabled="!aktifkanForm" /></label>
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary" for="kecamatan"><span>{{ TEKS_LAPORAN_PUBLIK.kecamatan }}</span><PublicSelect id="kecamatan" v-model="kecamatanId" placeholder="Pilih kecamatan" :options="opsiKecamatan" :disabled="!aktifkanForm || !kabupatenId" /></label>
              <p v-if="kabupaten.pending.value" class="text-sm text-muted-foreground sm:col-span-2" role="status">Memuat kabupaten/kota...</p><p v-else-if="kabupaten.error.value" class="text-sm text-destructive sm:col-span-2" role="alert">Kabupaten/kota belum dapat dimuat.</p><p v-else-if="!kabupaten.data.value?.length" class="text-sm text-muted-foreground sm:col-span-2">Data kabupaten/kota belum tersedia.</p>
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary sm:col-span-2" for="desa"><span>{{ TEKS_LAPORAN_PUBLIK.desa }}</span><PublicSelect id="desa" v-model="isian.desa_kelurahan_id" placeholder="Pilih desa/kelurahan" :options="opsiDesa" :disabled="!aktifkanForm || !kecamatanId" /></label>
              <p v-if="kecamatan.pending.value" class="text-sm text-muted-foreground sm:col-span-2" role="status">Memuat kecamatan...</p><p v-else-if="kecamatan.error.value" class="text-sm text-destructive sm:col-span-2" role="alert">Kecamatan belum dapat dimuat.</p><p v-if="desa.pending.value" class="text-sm text-muted-foreground sm:col-span-2" role="status">Memuat desa/kelurahan...</p><p v-else-if="desa.error.value" class="text-sm text-destructive sm:col-span-2" role="alert">Desa/kelurahan belum dapat dimuat.</p>
              <p v-if="kantor.data.value?.nama" class="bg-muted p-4 text-sm leading-6 text-foreground sm:col-span-2">{{ TEKS_LAPORAN_PUBLIK.kantor }} <strong class="block mt-1 text-primary">{{ kantor.data.value.nama.toLocaleUpperCase('id') }}</strong></p>
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary sm:col-span-2" for="alamat"><span>{{ TEKS_LAPORAN_PUBLIK.alamat }}</span><textarea id="alamat" v-model="isian.alamat_pelapor" class="w-full min-w-0 rounded-xl border border-input bg-background px-4 py-3 text-base font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary" maxlength="500" required rows="3" /></label>
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary sm:col-span-2" for="jenis"><span>{{ TEKS_LAPORAN_PUBLIK.jenisTerlapor }}</span><PublicSelect id="jenis" v-model="isian.jenis_terlapor" placeholder="Pilih jenis terlapor" :options="opsiJenisTerlapor" :disabled="!aktifkanForm" /></label>
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary sm:col-span-2" for="isi"><span>{{ TEKS_LAPORAN_PUBLIK.isi }}</span><textarea id="isi" v-model="isian.isi_laporan" class="w-full min-w-0 rounded-xl border border-input bg-background px-4 py-3 text-base font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary" minlength="10" maxlength="5000" required rows="8" /><span class="text-right text-xs font-medium text-muted-foreground">{{ isian.isi_laporan.length }}/5000</span></label>
              <label class="grid min-w-0 gap-2 text-sm font-bold text-primary sm:col-span-2" for="foto"><span>{{ TEKS_LAPORAN_PUBLIK.foto }}</span><span class="-mt-1 text-xs font-normal leading-5 text-muted-foreground">JPG, PNG, atau WebP · maksimal 1 foto · ukuran maksimal 3 MB</span><input id="foto" ref="inputFoto" class="w-full min-w-0 rounded-xl border border-input bg-background p-2 text-base font-normal text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:font-semibold" type="file" :accept="BATAS_FILE.foto.tipeDiizinkan.join(',')" @change="pilihFoto"></label>
              <div v-if="pratinjauFoto" class="flex min-w-0 items-center gap-4 rounded-2xl bg-muted p-3 sm:p-4 sm:col-span-2"><img class="size-24 shrink-0 rounded-xl object-cover ring-2 ring-card sm:size-28" :src="pratinjauFoto" alt="Pratinjau foto pendukung"><div class="min-w-0 flex-1"><p class="truncate font-bold text-primary">{{ foto?.name }}</p><p class="mt-1 text-sm text-muted-foreground">{{ ukuranFoto(foto?.size) }} · Siap diunggah</p><button class="mt-3 min-h-10 font-bold text-destructive underline underline-offset-4" type="button" @click="hapusFoto">{{ TEKS_LAPORAN_PUBLIK.hapusFoto }}</button></div></div>
              <details class="bg-muted p-5 sm:col-span-2"><summary class="cursor-pointer font-bold text-primary">{{ TEKS_LAPORAN_PUBLIK.tindakLanjut }}</summary><label class="mt-5 grid gap-2 text-sm font-bold text-primary" for="kode-sebelumnya"><span>{{ TEKS_LAPORAN_PUBLIK.kodeSebelumnya }}</span><input id="kode-sebelumnya" v-model="isian.kode_laporan_sebelumnya" class="min-h-12 rounded-xl border border-input bg-background px-4 font-mono text-base font-normal tracking-wider text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary" :placeholder="FORMAT_KODE_PELACAKAN" autocomplete="off"></label></details>
            </div>
            <button class="min-h-14 rounded-xl bg-primary px-6 font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50" type="submit" :disabled="!aktifkanForm || !valid">{{ sedangMengirim ? TEKS_LAPORAN_PUBLIK.mengirim : TEKS_LAPORAN_PUBLIK.kirim }}</button>
          </fieldset>
          <p v-if="pesanError" class="mt-5 bg-destructive/10 p-4 text-sm font-medium text-destructive" role="alert">{{ pesanError }}</p>
        </form>
      </div>
    </section>
    <dialog ref="dialogLokasi" class="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2.5rem)] max-w-[31rem] overflow-y-auto rounded-2xl border-0 bg-card p-0 text-foreground shadow-card backdrop:bg-primary/60" aria-labelledby="judul-dialog-lokasi">
      <section class="p-6 sm:p-9">
        <p class="text-xs font-extrabold uppercase tracking-[.18em] text-accent">Sebelum mengisi aduan</p>
        <h2 id="judul-dialog-lokasi" class="mt-4 text-3xl font-black leading-tight text-primary">Aktifkan lokasi perangkat</h2>
        <p v-if="keadaanLokasi === 'meminta'" class="mt-5 leading-7 text-muted-foreground" role="status">{{ TEKS_LAPORAN_PUBLIK.memintaLokasi }}</p>
        <p v-else-if="keadaanLokasi === 'ditolak' || keadaanLokasi === 'gps-mati' || keadaanLokasi === 'timeout' || keadaanLokasi === 'tidak-didukung'" class="mt-5 leading-7 text-destructive" role="alert">{{ keadaanLokasi === 'ditolak' ? TEKS_LAPORAN_PUBLIK.izinDitolak : keadaanLokasi === 'gps-mati' ? TEKS_LAPORAN_PUBLIK.gpsMati : keadaanLokasi === 'timeout' ? TEKS_LAPORAN_PUBLIK.gpsTimeout : TEKS_LAPORAN_PUBLIK.gpsTidakDidukung }}</p>
        <p v-else class="mt-5 leading-7 text-muted-foreground">{{ TEKS_LAPORAN_PUBLIK.tungguLokasi }}</p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button v-if="keadaanLokasi !== 'berhasil' && keadaanLokasi !== 'tidak-didukung'" class="min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary disabled:opacity-60 sm:w-auto" type="button" :disabled="keadaanLokasi === 'meminta'" @click="dapatkanLokasi">{{ keadaanLokasi === 'ditolak' || keadaanLokasi === 'gps-mati' || keadaanLokasi === 'timeout' ? TEKS_LAPORAN_PUBLIK.cobaLagi : keadaanLokasi === 'meminta' ? TEKS_LAPORAN_PUBLIK.memintaLokasi : TEKS_LAPORAN_PUBLIK.izinkanLokasi }}</button>
          <button class="min-h-12 w-full px-3 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 sm:w-auto" type="button" @click="tutupLokasi">Tutup</button>
        </div>
      </section>
    </dialog>
    <dialog ref="dialogSukses" class="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(42rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-border bg-card p-0 text-foreground shadow-card backdrop:bg-black/50" @cancel="tutupSukses">
      <section class="p-6 sm:p-8"><h2 class="text-2xl font-black text-primary">{{ TEKS_LAPORAN_PUBLIK.sukses }}</h2><p class="mt-2 text-muted-foreground">{{ TEKS_LAPORAN_PUBLIK.simpanKode }}</p><div class="mt-4 flex flex-wrap items-center gap-3"><strong class="rounded-lg bg-muted px-4 py-3 font-mono text-xl tracking-wider text-primary">{{ kodePelacakan }}</strong><button class="min-h-11 rounded-lg border border-border px-4 font-bold text-primary" type="button" @click="salinKode">{{ sudahDisalin ? TEKS_LAPORAN_PUBLIK.tersalin : TEKS_LAPORAN_PUBLIK.salinKode }}</button></div><template v-if="waktuDiterima"><h3 class="mt-7 font-bold text-primary">Riwayat status</h3><TimelineStatus class="mt-4" :timeline="[{ status: 'diterima', waktu: waktuDiterima }]" /></template><div class="mt-6 flex flex-wrap gap-3"><NuxtLink class="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 font-bold text-accent-foreground no-underline" :to="`/lacak?kode=${encodeURIComponent(kodePelacakan)}`">{{ TEKS_LAPORAN_PUBLIK.cekStatus }}</NuxtLink><button class="min-h-11 rounded-lg border border-border px-4 font-bold" type="button" @click="tutupSukses()">{{ TEKS_LAPORAN_PUBLIK.tutup }}</button></div></section>
    </dialog>
  </main>
</template>
