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
  <main>
    <section class="bg-primary text-primary-foreground">
      <div class="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <p class="text-xs font-extrabold uppercase tracking-[.18em] text-accent">Pelayanan masyarakat</p>
        <h1 class="mt-5 max-w-3xl text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl">{{ TEKS_LACAK_PUBLIK.judul }}</h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-white/75">{{ TEKS_LACAK_PUBLIK.petunjuk }}</p>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
      <div class="mx-auto max-w-3xl">
        <form class="bg-card p-6 shadow-card sm:p-10" @submit.prevent="cari">
          <label class="block text-sm font-extrabold uppercase tracking-[.14em] text-primary" for="kode">{{ TEKS_LACAK_PUBLIK.labelKode }}</label>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <input id="kode" v-model="kode" class="min-h-14 flex-1 rounded-xl border border-input bg-background px-4 font-mono text-base tracking-wider text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary" :placeholder="FORMAT_KODE_PELACAKAN" autocomplete="off" required>
            <button class="min-h-14 rounded-xl bg-primary px-7 font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-secondary disabled:cursor-wait disabled:opacity-60" type="submit" :disabled="sedangMemuat">{{ sedangMemuat ? TEKS_LACAK_PUBLIK.mengirim : TEKS_LACAK_PUBLIK.cek }}</button>
          </div>
          <p v-if="pesanError" class="mt-4 bg-destructive/10 p-4 text-sm font-medium text-destructive" role="alert">{{ pesanError }}</p>
        </form>
        <section v-if="hasil" class="mt-10 bg-card p-6 shadow-card sm:p-10" aria-live="polite">
          <div class="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-7">
            <div><p class="text-xs font-extrabold uppercase tracking-[.16em] text-muted-foreground">{{ TEKS_LACAK_PUBLIK.statusKini }}</p><div class="mt-3"><StatusBadge :status="hasil.status" /></div><p class="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{{ statusKini?.penjelasan }}</p></div>
            <button class="min-h-11 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 transition hover:-translate-y-0.5 disabled:opacity-60" type="button" :disabled="sedangMemuat" @click="cari">{{ TEKS_LACAK_PUBLIK.muatUlang }}</button>
          </div>
          <dl class="grid gap-x-8 gap-y-6 py-7 sm:grid-cols-2">
            <div><dt class="text-sm text-muted-foreground">Kode laporan</dt><dd class="mt-1 font-mono font-bold tracking-wider text-primary">{{ hasil.kode_pelacakan }}</dd></div>
            <div><dt class="text-sm text-muted-foreground">Dikirim</dt><dd class="mt-1 font-semibold text-foreground">{{ formatTanggalWib(hasil.dikirim_pada) }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-sm text-muted-foreground">Kantor penanganan</dt><dd class="mt-1 font-semibold text-foreground">{{ hasil.kantor }}</dd></div>
          </dl>
          <div class="border-t border-border pt-7"><h2 class="text-2xl font-extrabold text-primary">{{ TEKS_LACAK_PUBLIK.riwayat }}</h2><TimelineStatus class="mt-7" :timeline="hasil.timeline" /></div>
        </section>
      </div>
    </section>
  </main>
</template>
