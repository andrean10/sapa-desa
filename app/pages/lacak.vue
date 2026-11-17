<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FORMAT_KODE_PELACAKAN, REGEX_KODE_PELACAKAN } from '~~/shared/config/app'
import { STATUS_LAPORAN, STATUS_LAPORAN_TAMPILAN, TEKS_LACAK_PUBLIK } from '~~/shared/config/teks'
import { formatInputKodePelacakan } from '~~/shared/utils/kode-pelacakan'
import { formatTanggalWaktuWib } from '~~/shared/utils/waktu'
import StatusBadge from '~/components/StatusBadge.vue'
import TimelineStatus from '~/components/public/TimelineStatus.vue'

definePageMeta({ layout: 'publik' })
useHead({ title: TEKS_LACAK_PUBLIK.judul })
const route = useRoute()
const { lacak } = useLacakLaporan()
const kode = ref('')
const hasil = ref<Awaited<ReturnType<typeof lacak>>>()
const sedangMemuat = ref(false)
const pesanError = ref('')
const statusKini = computed(() => STATUS_LAPORAN_TAMPILAN.find(item => item.value === hasil.value?.status))
// Langkah progres: alur normal tanpa 'ditolak'. Bila ditolak, tampilkan hanya tahap yang benar-benar dilalui + ditolak.
const langkah = computed(() => {
  if (hasil.value?.status !== 'ditolak') return STATUS_LAPORAN.filter(item => item.value !== 'ditolak')
  const dilalui = new Set(hasil.value.timeline.map(butir => butir.status))
  return STATUS_LAPORAN.filter(item => dilalui.has(item.value))
})
const indeksKini = computed(() => langkah.value.findIndex(item => item.value === hasil.value?.status))
const pembaruanTerakhir = computed(() => hasil.value?.timeline.at(-1)?.waktu)

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
          <p v-if="pesanError" class="mt-4 border-s-4 border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive" role="alert">{{ pesanError }}</p>
          <p v-else class="mt-3 text-sm text-muted-foreground">{{ TEKS_LACAK_PUBLIK.bantuanKode }}</p>
        </form>
        <div v-if="sedangMemuat && !hasil" class="mt-10 animate-pulse space-y-5 bg-card p-6 shadow-card sm:p-10" role="status" aria-label="Memuat status laporan">
          <div class="h-5 w-1/3 bg-muted" /><div class="h-9 w-2/3 bg-muted" /><div class="h-2 w-full bg-muted" /><div class="h-24 w-full bg-muted" />
        </div>
        <section v-if="hasil" class="mt-10 bg-card shadow-card transition-opacity" :class="sedangMemuat ? 'opacity-60' : ''" aria-live="polite">
          <div class="p-6 sm:p-10">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-xs font-extrabold uppercase tracking-[.16em] text-muted-foreground">{{ TEKS_LACAK_PUBLIK.kodeLaporan }}</p>
                <p class="mt-2 font-mono text-2xl font-black tracking-wider text-primary sm:text-3xl">{{ hasil.kode_pelacakan }}</p>
              </div>
              <StatusBadge class="px-4 py-1.5 text-sm" :status="hasil.status" />
            </div>
            <div class="mt-6 border-s-4 bg-muted p-4" :style="{ borderColor: statusKini?.warna.teks }" role="status">
              <p class="text-xs font-extrabold uppercase tracking-[.14em] text-muted-foreground">{{ TEKS_LACAK_PUBLIK.statusKini }}</p>
              <p class="mt-1 text-base font-semibold leading-7 text-foreground">{{ statusKini?.penjelasan }}</p>
            </div>
            <div class="mt-8">
              <h2 class="sr-only">{{ TEKS_LACAK_PUBLIK.progres }}</h2>
              <ol class="grid gap-2 sm:gap-3" :style="{ gridTemplateColumns: `repeat(${langkah.length}, minmax(0, 1fr))` }">
                <li v-for="(item, index) in langkah" :key="item.value" :aria-current="index === indeksKini ? 'step' : undefined">
                  <div class="h-2 rounded-full" :class="index <= indeksKini ? '' : 'bg-border'" :style="index <= indeksKini ? { backgroundColor: statusKini?.warna.teks } : undefined" />
                  <p class="mt-2 text-xs font-bold sm:text-sm" :class="index <= indeksKini ? 'text-primary' : 'text-muted-foreground'">{{ item.label }}</p>
                </li>
              </ol>
            </div>
          </div>
          <dl class="divide-y divide-border border-t border-border px-6 sm:px-10">
            <div class="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4"><dt class="text-sm text-muted-foreground">{{ TEKS_LACAK_PUBLIK.dikirim }}</dt><dd class="font-semibold text-foreground sm:col-span-2">{{ formatTanggalWaktuWib(hasil.dikirim_pada) }}</dd></div>
            <div class="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4"><dt class="text-sm text-muted-foreground">{{ TEKS_LACAK_PUBLIK.kantorPenanganan }}</dt><dd class="font-semibold text-foreground sm:col-span-2">{{ hasil.kantor }}</dd></div>
            <div v-if="pembaruanTerakhir" class="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4"><dt class="text-sm text-muted-foreground">{{ TEKS_LACAK_PUBLIK.pembaruanTerakhir }}</dt><dd class="font-semibold text-foreground sm:col-span-2">{{ formatTanggalWaktuWib(pembaruanTerakhir) }}</dd></div>
          </dl>
          <div class="border-t border-border p-6 sm:p-10">
            <h2 class="text-2xl font-extrabold text-primary">{{ TEKS_LACAK_PUBLIK.riwayat }}</h2>
            <TimelineStatus class="mt-7" :timeline="hasil.timeline" />
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
