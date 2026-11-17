<script setup lang="ts">
import { CalendarRange } from '@lucide/vue'
import { Input } from '~/components/ui/input'
import type { ModePeriode, RentangTanggal } from '~~/shared/utils/waktu'
import { formatTanggalWib, rentangPeriode, tanggalHariIniWib } from '~~/shared/utils/waktu'

const LABEL: Record<ModePeriode, string> = { bulan_ini: 'Bulan ini', bulan_lalu: 'Bulan lalu', tahun_ini: 'Tahun ini', enam_bulan: '6 bulan', kustom: 'Kustom' }
const properti = withDefaults(defineProps<{ opsi?: ModePeriode[]; tampilkanRentang?: boolean }>(), { opsi: () => ['bulan_ini', 'bulan_lalu', 'tahun_ini', 'kustom'], tampilkanRentang: true })
const mode = defineModel<ModePeriode>('mode', { required: true })
const kustom = defineModel<RentangTanggal>('kustom', { required: true })
const hariIni = tanggalHariIniWib()
const rentang = computed(() => rentangPeriode(mode.value, kustom.value, hariIni))
const labelRentang = computed(() => rentang.value.mulai && rentang.value.selesai ? `${formatTanggalWib(`${rentang.value.mulai}T00:00:00+07:00`)} – ${formatTanggalWib(`${rentang.value.selesai}T00:00:00+07:00`)}` : 'Pilih tanggal')
const idGrup = useId()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-2 sm:items-end">
    <div class="flex max-w-full flex-wrap items-center gap-2">
      <div class="inline-flex max-w-full overflow-x-auto rounded-lg border bg-muted/60 p-0.5" role="radiogroup" :aria-labelledby="idGrup">
        <span :id="idGrup" class="sr-only">Periode</span>
        <button
          v-for="item in properti.opsi"
          :key="item"
          type="button"
          role="radio"
          :aria-checked="mode === item"
          class="h-8 shrink-0 rounded-md px-3 text-sm font-medium whitespace-nowrap transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          :class="mode === item ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'"
          @click="mode = item"
        >{{ LABEL[item] }}</button>
      </div>
    </div>
    <div v-if="mode === 'kustom'" class="flex flex-wrap items-center gap-2 text-sm">
      <label class="sr-only" :for="`${idGrup}-dari`">Dari tanggal</label>
      <Input :id="`${idGrup}-dari`" v-model="kustom.mulai" type="date" class="h-8 w-40 bg-card" :max="kustom.selesai || hariIni" />
      <span class="text-muted-foreground">–</span>
      <label class="sr-only" :for="`${idGrup}-sampai`">Sampai tanggal</label>
      <Input :id="`${idGrup}-sampai`" v-model="kustom.selesai" type="date" class="h-8 w-40 bg-card" :min="kustom.mulai" :max="hariIni" />
    </div>
    <p v-else-if="tampilkanRentang" class="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarRange class="size-3.5" aria-hidden="true" />{{ labelRentang }}</p>
  </div>
</template>
