<template>
  <main class="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-12">
    <div class="mx-auto max-w-3xl">
    <header class="mb-6">
      <NuxtLink class="font-extrabold text-primary no-underline" to="/">← {{ APP_NAME }}</NuxtLink>
      <h1 class="mt-8 text-4xl font-black tracking-tight text-primary">Kirim laporan pengaduan</h1>
      <p class="mt-2 text-muted">{{ REGIONAL_OFFICE_NAME }}</p>
    </header>

    <section class="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7" aria-labelledby="judul-lokasi">
      <h2 id="judul-lokasi" class="text-xl font-extrabold text-primary">{{ koordinat ? 'Lokasi berhasil didapat' : 'Mengaktifkan lokasi GPS' }}</h2>
      <p class="mt-2 leading-6 text-muted">Lokasi diperlukan agar laporan diteruskan ke kantor imigrasi yang menangani wilayah Anda.</p>
      <button v-if="!koordinat || pesanLokasi" type="button" class="mt-4 min-h-11 rounded-lg bg-secondary px-4 font-bold text-white hover:bg-primary disabled:cursor-wait disabled:opacity-60" :disabled="sedangMencariLokasi" @click="dapatkanLokasi">
        {{ sedangMencariLokasi ? 'Mencari lokasi…' : 'Coba GPS lagi' }}
      </button>
      <p v-if="pesanLokasi" class="mt-3 rounded-lg bg-background p-3 text-destructive" role="status">{{ pesanLokasi }}</p>
      <p v-else-if="sedangMencariLokasi" class="mt-3 text-sm text-muted" role="status">Izinkan akses lokasi pada dialog browser untuk melanjutkan.</p>
      <p v-else-if="koordinat" class="mt-3 font-semibold text-secondary" role="status">Formulir dapat diisi.</p>
    </section>

    <form class="mt-6 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8" @submit.prevent="kirim">
      <fieldset class="grid gap-3 disabled:opacity-60" :disabled="!koordinat || sedangMengirim">
        <legend class="mb-3 text-xl font-extrabold text-primary">Informasi laporan</legend>

        <label class="mt-2 font-semibold" for="nama">Nama pelapor</label>
        <input id="nama" v-model="isian.nama_pelapor" class="min-h-11 rounded-lg border border-border px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary" maxlength="150" required autocomplete="name">

        <label class="mt-2 font-semibold" for="alamat">Alamat pelapor</label>
        <textarea id="alamat" v-model="isian.alamat_pelapor" class="rounded-lg border border-border px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary" maxlength="500" required rows="3" />

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid content-start gap-3">
            <label class="mt-2 font-semibold" for="kabupaten">Kabupaten/kota</label>
            <select id="kabupaten" v-model="kabupatenId" class="min-h-11 rounded-lg border border-border bg-white px-3" required>
              <option value="">Pilih kabupaten/kota</option>
              <option v-for="item in kabupaten.data.value" :key="item.id" :value="item.id">{{ item.nama }}</option>
            </select>
            <small v-if="kabupaten.pending.value" class="text-sm text-muted">Memuat kabupaten/kota…</small>
            <small v-else-if="kabupaten.error.value" class="text-sm text-destructive">Kabupaten/kota belum dapat dimuat.</small>
            <small v-else-if="!kabupaten.data.value?.length" class="text-sm text-muted">Data kabupaten/kota belum tersedia.</small>
          </div>
          <div class="grid content-start gap-3">
            <label class="mt-2 font-semibold" for="kecamatan">Kecamatan</label>
            <select id="kecamatan" v-model="kecamatanId" class="min-h-11 rounded-lg border border-border bg-white px-3" required :disabled="!kabupatenId">
              <option value="">Pilih kecamatan</option>
              <option v-for="item in kecamatan.data.value" :key="item.id" :value="item.id">{{ item.nama }}</option>
            </select>
            <small v-if="kecamatan.pending.value" class="text-sm text-muted">Memuat kecamatan…</small>
            <small v-else-if="kecamatan.error.value" class="text-sm text-destructive">Kecamatan belum dapat dimuat.</small>
            <small v-else-if="kabupatenId && !kecamatan.data.value?.length" class="text-sm text-muted">Data kecamatan belum tersedia.</small>
          </div>
        </div>

        <label class="mt-2 font-semibold" for="desa">Desa/kelurahan</label>
        <select id="desa" v-model="isian.desa_kelurahan_id" class="min-h-11 rounded-lg border border-border bg-white px-3" required :disabled="!kecamatanId">
          <option value="">Pilih desa/kelurahan</option>
          <option v-for="item in desa.data.value" :key="item.id" :value="item.id">{{ item.nama }} ({{ labelWilayah(item.jenis_wilayah) }})</option>
        </select>
        <small v-if="desa.pending.value" class="text-sm text-muted">Memuat desa/kelurahan…</small>
        <small v-else-if="desa.error.value" class="text-sm text-destructive">Desa/kelurahan belum dapat dimuat.</small>
        <small v-else-if="kecamatanId && !desa.data.value?.length" class="text-sm text-muted">Data desa/kelurahan belum tersedia.</small>

        <label class="mt-2 font-semibold" for="jenis">Jenis terlapor</label>
        <select id="jenis" v-model="isian.jenis_terlapor" class="min-h-11 rounded-lg border border-border bg-white px-3" required>
          <option value="">Pilih jenis terlapor</option>
          <option v-for="jenis in JENIS_TERLAPOR" :key="jenis.value" :value="jenis.value">{{ jenis.label }}</option>
        </select>

        <label class="mt-2 font-semibold" for="isi">Isi laporan</label>
        <textarea id="isi" v-model="isian.isi_laporan" class="rounded-lg border border-border px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary" minlength="10" maxlength="5000" required rows="6" />

        <label class="mt-2 font-semibold" for="kode-sebelumnya">Kode laporan sebelumnya (opsional)</label>
        <input id="kode-sebelumnya" v-model="isian.kode_laporan_sebelumnya" class="min-h-11 rounded-lg border border-border px-3" :placeholder="FORMAT_KODE_PELACAKAN" autocomplete="off">

        <label class="mt-2 font-semibold" for="foto">Foto pendukung (opsional, maks. 3 MB)</label>
        <input id="foto" class="rounded-lg border border-border p-2 file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-3 file:py-2" type="file" accept="image/jpeg,image/png,image/webp" @change="pilihFoto">

        <button class="mt-3 min-h-12 rounded-lg bg-primary px-5 font-bold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50" type="submit" :disabled="sedangMengirim || !koordinat">
          {{ sedangMengirim ? 'Mengirim laporan…' : 'Kirim laporan' }}
        </button>
      </fieldset>
      <p v-if="pesanError" class="mt-4 rounded-lg bg-background p-3 text-destructive" role="alert">{{ pesanError }}</p>
      <section v-if="kodePelacakan" class="mt-5 rounded-xl bg-background p-5" aria-live="polite">
        <h2 class="text-xl font-extrabold text-primary">Laporan berhasil dikirim</h2>
        <p class="mt-2 text-muted">Simpan kode ini untuk melacak laporan Anda:</p>
        <strong class="mt-2 block text-xl tracking-wider text-primary">{{ kodePelacakan }}</strong>
        <NuxtLink class="mt-4 inline-block font-bold text-secondary underline" to="/lacak">Lacak laporan</NuxtLink>
      </section>
    </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { APP_NAME, FORMAT_KODE_PELACAKAN, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'
import { JENIS_TERLAPOR, JENIS_WILAYAH_DESA } from '~~/shared/config/teks'
import type { Enums } from '~~/shared/types/database.types'

const { kabupaten: dataKabupaten, kecamatan: ambilKecamatan, desa: ambilDesa } = useWilayah()
const { kirimLaporan } = useLaporan()
const kabupaten = dataKabupaten
const kabupatenId = ref('')
const kecamatanId = ref('')
const kecamatan = ambilKecamatan(kabupatenId)
const desa = ambilDesa(kecamatanId)
const koordinat = ref<{ lintang: number; bujur: number; akurasi: number }>()
const sedangMencariLokasi = ref(false)
const sedangMengirim = ref(false)
const pesanLokasi = ref('')
const pesanError = ref('')
const kodePelacakan = ref('')
const foto = ref<File>()
const isian = reactive({
  nama_pelapor: '',
  alamat_pelapor: '',
  desa_kelurahan_id: '',
  jenis_terlapor: '',
  isi_laporan: '',
  kode_laporan_sebelumnya: ''
})

watch(kabupatenId, () => {
  kecamatanId.value = ''
  isian.desa_kelurahan_id = ''
})
watch(kecamatanId, () => { isian.desa_kelurahan_id = '' })

onMounted(dapatkanLokasi)

function labelWilayah(value: Enums<'jenis_wilayah_desa'>) {
  return JENIS_WILAYAH_DESA.find(item => item.value === value)?.label ?? value
}

function dapatkanLokasi() {
  pesanLokasi.value = ''
  if (!navigator.geolocation) {
    pesanLokasi.value = 'GPS tidak tersedia di perangkat atau browser ini.'
    return
  }

  sedangMencariLokasi.value = true
  navigator.geolocation.getCurrentPosition(
    (posisi) => {
      koordinat.value = {
        lintang: posisi.coords.latitude,
        bujur: posisi.coords.longitude,
        akurasi: posisi.coords.accuracy
      }
      sedangMencariLokasi.value = false
    },
    (error) => {
      sedangMencariLokasi.value = false
      pesanLokasi.value = error.code === error.PERMISSION_DENIED
        ? 'Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser untuk mengisi formulir.'
        : 'GPS tidak aktif atau lokasi belum tersedia. Periksa GPS perangkat lalu coba lagi.'
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

function pilihFoto(event: Event) {
  foto.value = (event.target as HTMLInputElement).files?.[0]
}

async function kirim() {
  if (!koordinat.value) return
  sedangMengirim.value = true
  pesanError.value = ''
  kodePelacakan.value = ''

  const form = new FormData()
  for (const [kunci, nilai] of Object.entries(isian)) form.append(kunci, nilai)
  form.append('lintang', String(koordinat.value.lintang))
  form.append('bujur', String(koordinat.value.bujur))
  form.append('akurasi_meter', String(koordinat.value.akurasi))
  if (foto.value) form.append('foto', foto.value)

  try {
    const hasil = await kirimLaporan(form)
    kodePelacakan.value = hasil.kode_pelacakan
  } catch (error) {
    pesanError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Laporan belum dapat dikirim.')
      : 'Laporan belum dapat dikirim. Periksa koneksi lalu coba lagi.'
  } finally {
    sedangMengirim.value = false
  }
}
</script>

