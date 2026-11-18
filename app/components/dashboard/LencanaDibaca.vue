<script setup lang="ts">
import { Check, CheckCheck } from '@lucide/vue'
import { LABEL_DIBACA } from '~~/shared/config/teks'
import { formatRelatifWib, formatTanggalWaktuWib } from '~~/shared/utils/waktu'

// Penanda seperti centang WhatsApp, HANYA untuk pemantauan Kanwil/admin. Jangan dipakai di halaman UPT atau publik.
const properti = defineProps<{ dibacaPada: string | null | undefined; tanpaWaktu?: boolean }>()
const judul = computed(() => properti.dibacaPada ? `${LABEL_DIBACA.sudah}: ${formatTanggalWaktuWib(properti.dibacaPada)}` : LABEL_DIBACA.belum)
</script>

<template>
  <span v-if="dibacaPada" class="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-info" :title="judul">
    <CheckCheck class="size-4" aria-hidden="true" />{{ LABEL_DIBACA.sudah }}<template v-if="!tanpaWaktu"> · <span class="font-normal text-muted-foreground">{{ formatRelatifWib(dibacaPada) }}</span></template>
  </span>
  <span v-else class="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-peringatan" :title="judul">
    <Check class="size-4" aria-hidden="true" />{{ LABEL_DIBACA.belum }}
  </span>
</template>
