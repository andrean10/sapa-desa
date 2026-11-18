<script setup lang="ts">
import { Lock, UserRoundCheck } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog'
import { STATUS_LAPORAN_TAMPILAN, TEKS_UMUM } from '~~/shared/config/teks'
import type { Enums } from '~~/shared/types/database.types'

// Panel ubah status (PRD 7.3): hanya pilihan yang sah menurut alur; keterangan wajib untuk status final + konfirmasi.
type Status = Enums<'status_laporan'>
const ALUR: Record<Status, Status[]> = { diterima: ['diverifikasi', 'ditolak'], diverifikasi: ['ditindaklanjuti', 'ditolak'], ditindaklanjuti: ['selesai'], selesai: [], ditolak: [] }
const properti = defineProps<{ statusKini: Status; menyimpan: boolean; pesan?: string; diprosesOleh?: string; modeAdmin?: boolean }>()
const emit = defineEmits<{ simpan: [status: Status, keterangan: string] }>()

const pilihan = computed(() => ALUR[properti.statusKini])
const tujuan = ref<Status | ''>('')
const keterangan = ref('')
const galatLokal = ref('')
const konfirmasiTerbuka = ref(false)
const wajibKeterangan = computed(() => tujuan.value === 'ditolak' || tujuan.value === 'selesai')
const labelStatus = (status: Status | '') => STATUS_LAPORAN_TAMPILAN.find(item => item.value === status)
watch(() => properti.statusKini, () => { tujuan.value = ''; keterangan.value = ''; galatLokal.value = '' })

function ajukan() {
  galatLokal.value = ''
  if (!tujuan.value) return
  if (wajibKeterangan.value && !keterangan.value.trim()) { galatLokal.value = 'Keterangan wajib diisi untuk status ini.'; return }
  if (wajibKeterangan.value) { konfirmasiTerbuka.value = true; return }
  emit('simpan', tujuan.value, keterangan.value.trim())
}
function konfirmasi() {
  konfirmasiTerbuka.value = false
  if (tujuan.value) emit('simpan', tujuan.value, keterangan.value.trim())
}
</script>

<template>
  <section class="rounded-xl border border-border/80 bg-card shadow-xs">
    <header class="border-b px-5 py-4"><h2 class="font-semibold">Ubah status</h2><p class="text-sm text-muted-foreground">{{ modeAdmin ? 'Perubahan dicatat atas nama Admin.' : 'Pilih langkah berikutnya sesuai alur penanganan.' }}</p></header>
    <div v-if="!pilihan.length" class="flex items-center gap-3 p-5 text-sm text-muted-foreground"><Lock class="size-4 shrink-0" aria-hidden="true" />Laporan sudah final dan tidak dapat diubah.</div>
    <form v-else class="grid gap-4 p-5" @submit.prevent="ajukan">
      <fieldset class="grid gap-2">
        <legend class="mb-2 text-sm font-medium">Status berikutnya</legend>
        <label v-for="status in pilihan" :key="status" class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition has-checked:border-primary has-checked:bg-primary/[0.04] has-checked:ring-1 has-checked:ring-primary/30 hover:bg-muted/40">
          <input v-model="tujuan" type="radio" name="status-baru" :value="status" class="accent-primary">
          <span class="flex flex-wrap items-center gap-2"><DashboardLencanaStatus :status="status" /><span v-if="status === 'ditolak' || status === 'selesai'" class="text-xs text-muted-foreground">Final · keterangan wajib</span></span>
        </label>
      </fieldset>
      <div class="grid gap-1.5">
        <label for="keterangan-status" class="text-sm font-medium">Keterangan <span class="font-normal text-muted-foreground">({{ wajibKeterangan ? 'wajib' : 'opsional' }})</span></label>
        <p class="text-xs font-medium text-peringatan">{{ TEKS_UMUM.keteranganPublik }}.</p>
        <Textarea id="keterangan-status" v-model="keterangan" maxlength="1000" rows="4" :required="wajibKeterangan" :aria-invalid="Boolean(galatLokal)" aria-describedby="bantuan-keterangan" />
        <div id="bantuan-keterangan" class="flex justify-between gap-3 text-xs text-muted-foreground"><span>Jangan menuliskan identitas orang asing atau data sensitif.</span><span class="tabular-nums">{{ keterangan.length }}/1000</span></div>
      </div>
      <div v-if="!modeAdmin && diprosesOleh" class="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
        <UserRoundCheck class="size-4 text-sukses" aria-hidden="true" /><span class="text-muted-foreground">Dicatat sebagai</span><strong class="font-medium">{{ diprosesOleh }}</strong>
      </div>
      <p v-if="galatLokal || pesan" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ galatLokal || pesan }}</p>
      <Button type="submit" :variant="tujuan === 'ditolak' ? 'destructive' : 'default'" :disabled="!tujuan || menyimpan">{{ menyimpan ? 'Menyimpan…' : 'Simpan status' }}</Button>
    </form>
    <AlertDialog v-model:open="konfirmasiTerbuka">
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Ubah status menjadi {{ labelStatus(tujuan)?.label }}?</AlertDialogTitle><AlertDialogDescription>Status ini final dan tidak dapat diubah lagi. Lanjutkan?</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction :class="tujuan === 'ditolak' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''" @click="konfirmasi">Lanjutkan</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
