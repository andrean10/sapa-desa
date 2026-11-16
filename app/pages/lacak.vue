<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FORMAT_KODE_PELACAKAN, REGEX_KODE_PELACAKAN } from '~~/shared/config/app'
import { STATUS_LAPORAN, TEKS_LACAK_PUBLIK } from '~~/shared/config/teks'
import { formatInputKodePelacakan } from '~~/shared/utils/kode-pelacakan'
import { formatTanggalWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'publik' })
useHead({ title: TEKS_LACAK_PUBLIK.judul })
const route = useRoute()
const { lacak } = useLacakLaporan()
const kode = ref('')
const hasil = ref<Awaited<ReturnType<typeof lacak>>>()
const sedangMemuat = ref(false)
const pesanError = ref('')
const statusKini = computed(() => STATUS_LAPORAN.find(item => item.value === hasil.value?.status))

watch(kode, nilai => { kode.value = formatInputKodePelacakan(nilai) })
onMounted(() => {
  if (typeof route.query.kode === 'string') {
    kode.value = formatInputKodePelacakan(route.query.kode)
    void cari()
  }
})

async function cari() {
  pesanError.value = ''
  if (!REGEX_KODE_PELACAKAN.test(kode.value)) {
    pesanError.value = TEKS_LACAK_PUBLIK.tidakDitemukan
    return
  }
  sedangMemuat.value = true
  try {
    hasil.value = await lacak(kode.value)
  } catch (galat) {
    hasil.value = undefined
    const status = galat && typeof galat === 'object' && 'statusCode' in galat ? Number((galat as { statusCode?: number }).statusCode) : 0
    pesanError.value = status === 404 ? TEKS_LACAK_PUBLIK.tidakDitemukan : status === 429 ? TEKS_LACAK_PUBLIK.terlaluBanyak : TEKS_LACAK_PUBLIK.gagal
  } finally {
    sedangMemuat.value = false
  }
}

</script>

<template>
  <main class="mx-auto min-h-[70vh] max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
    <p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Pelayanan masyarakat</p>
    <h1 class="mt-2 text-4xl font-black tracking-tight text-primary">{{ TEKS_LACAK_PUBLIK.judul }}</h1>
    <p class="mt-3 text-muted-foreground">{{ TEKS_LACAK_PUBLIK.petunjuk }}</p>
    <form class="mt-7 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8" @submit.prevent="cari">
      <label class="font-semibold" for="kode">{{ TEKS_LACAK_PUBLIK.labelKode }}</label>
      <input id="kode" v-model="kode" class="min-h-12 rounded-lg border border-border bg-background px-3 font-mono text-base tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-ring" :placeholder="FORMAT_KODE_PELACAKAN" autocomplete="off" required>
      <button class="min-h-12 rounded-lg bg-primary px-5 font-bold text-white transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60" type="submit" :disabled="sedangMemuat">{{ sedangMemuat ? TEKS_LACAK_PUBLIK.mengirim : TEKS_LACAK_PUBLIK.cek }}</button>
      <p v-if="pesanError" class="rounded-lg bg-background p-3 text-destructive" role="alert">{{ pesanError }}</p>
    </form>
    <section v-if="hasil" class="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8" aria-live="polite">
      <dl class="grid gap-5 sm:grid-cols-2">
        <div><dt class="text-sm text-muted-foreground">Kode</dt><dd class="mt-1 font-bold tracking-wider text-primary">{{ hasil.kode_pelacakan }}</dd></div>
        <div><dt class="text-sm text-muted-foreground">{{ TEKS_LACAK_PUBLIK.statusKini }}</dt><dd class="mt-2"><StatusBadge :status="hasil.status" /><p class="mt-2 text-sm leading-6 text-muted-foreground">{{ statusKini?.penjelasan }}</p></dd></div>
        <div><dt class="text-sm text-muted-foreground">Kantor penanganan</dt><dd class="mt-1 font-semibold">{{ hasil.kantor }}</dd></div>
        <div><dt class="text-sm text-muted-foreground">Dikirim</dt><dd class="mt-1 font-semibold">{{ formatTanggalWib(hasil.dikirim_pada) }}</dd></div>
      </dl>
      <div class="mt-8 flex items-center justify-between gap-4"><h2 class="text-xl font-extrabold text-primary">{{ TEKS_LACAK_PUBLIK.riwayat }}</h2><button class="min-h-10 rounded-lg border border-border px-3 text-sm font-bold text-primary" type="button" :disabled="sedangMemuat" @click="cari">{{ TEKS_LACAK_PUBLIK.muatUlang }}</button></div>
      <TimelineStatus class="mt-5" :timeline="hasil.timeline" />
    </section>
  </main>
</template>
