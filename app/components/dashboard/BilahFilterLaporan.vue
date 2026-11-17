<script setup lang="ts">
import { Search, X } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Checkbox } from '~/components/ui/checkbox'
import { JENIS_TERLAPOR } from '~~/shared/config/teks'
import { tanggalHariIniWib } from '~~/shared/utils/waktu'

// Bilah filter daftar laporan: cari (utama) → status → jenis → rentang tanggal → urutan → reset.
export type FilterLaporan = { status: string[]; jenis: string; dari: string; sampai: string; cari: string; terlambat: boolean; urut?: string }
const properti = defineProps<{ aktif: boolean; terlambatNonaktif?: boolean }>()
const filter = defineModel<FilterLaporan>('filter', { required: true })
defineEmits<{ reset: [] }>()
const hariIni = tanggalHariIniWib()

// Pencarian ditunda sebentar agar tidak memanggil server di setiap ketukan.
const cari = ref(filter.value.cari)
const terapkanCari = useDebounceFn((nilai: string) => { filter.value.cari = nilai.trim() }, 350)
watch(cari, nilai => terapkanCari(nilai))
watch(() => filter.value.cari, (nilai) => { if (nilai !== cari.value.trim()) cari.value = nilai })
</script>

<template>
  <div class="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
    <div class="relative min-w-0 lg:w-72">
      <Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <label for="cari-laporan" class="sr-only">Cari kode, desa, atau kecamatan</label>
      <Input id="cari-laporan" v-model="cari" type="search" maxlength="100" placeholder="Cari kode, desa, atau kecamatan…" class="h-9 bg-card pl-9" />
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <slot name="awal" />
      <DashboardFilterStatus v-model="filter.status" />
      <label for="filter-jenis" class="sr-only">Jenis terlapor</label>
      <NativeSelect id="filter-jenis" v-model="filter.jenis" class="h-9 w-36 bg-card">
        <NativeSelectOption value="">WNA & WNI</NativeSelectOption>
        <NativeSelectOption v-for="item in JENIS_TERLAPOR" :key="item.value" :value="item.value">{{ item.singkat }} saja</NativeSelectOption>
      </NativeSelect>
      <div class="flex items-center gap-1.5 rounded-md border bg-card pr-1 pl-2.5 shadow-xs">
        <span class="text-xs text-muted-foreground">Masuk</span>
        <label for="filter-dari" class="sr-only">Dari tanggal</label>
        <input id="filter-dari" v-model="filter.dari" type="date" :max="filter.sampai || hariIni" class="h-8 w-32 bg-transparent text-sm outline-none focus-visible:ring-0">
        <span class="text-muted-foreground">–</span>
        <label for="filter-sampai" class="sr-only">Sampai tanggal</label>
        <input id="filter-sampai" v-model="filter.sampai" type="date" :min="filter.dari" :max="hariIni" class="h-8 w-32 bg-transparent text-sm outline-none">
      </div>
      <label class="flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 text-sm shadow-xs has-disabled:cursor-not-allowed has-disabled:opacity-50" :class="filter.terlambat ? 'border-destructive/40 bg-bahaya-muda text-destructive' : ''">
        <Checkbox v-model="filter.terlambat" :disabled="properti.terlambatNonaktif" />Terlambat saja
      </label>
      <template v-if="filter.urut !== undefined">
        <label for="filter-urut" class="sr-only">Urutan</label>
        <NativeSelect id="filter-urut" v-model="filter.urut" class="h-9 w-36 bg-card">
          <NativeSelectOption value="desc">Terbaru dulu</NativeSelectOption>
          <NativeSelectOption value="asc">Terlama dulu</NativeSelectOption>
        </NativeSelect>
      </template>
      <Button v-if="aktif" variant="ghost" class="h-9 text-muted-foreground" @click="$emit('reset')"><X class="size-4" />Reset</Button>
    </div>
  </div>
</template>
