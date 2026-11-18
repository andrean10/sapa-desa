<script setup lang="ts">
import { toast } from 'vue-sonner'
import { BookOpenText, ChevronDown, ChevronUp, ExternalLink, Globe, Pencil, Plus, Trash2 } from '@lucide/vue'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

definePageMeta({ layout: 'dashboard', title: 'Kelola FAQ' })
const kelola = useKelolaKanwil()
const { data, pending, error, refresh } = await useAsyncData('kanwil-faq', () => kelola.daftarFaq(), { lazy: true })
const bukaDialog = ref(false)
const idHapus = ref('')
const sedangSimpan = ref(false)
const pesan = ref('')
const isian = reactive({ id: '', pertanyaan: '', jawaban: '', urutan: 0 })
function tambah() { Object.assign(isian, { id: '', pertanyaan: '', jawaban: '', urutan: Math.max(0, ...(data.value ?? []).map(item => item.urutan)) + 1 }); pesan.value = ''; bukaDialog.value = true }
function ubah(item: NonNullable<typeof data.value>[number]) { Object.assign(isian, item); pesan.value = ''; bukaDialog.value = true }
async function simpan() {
  pesan.value = ''; sedangSimpan.value = true
  try { await kelola.simpanFaq({ ...isian, id: isian.id || undefined }); await refresh(); bukaDialog.value = false; toast.success(isian.id ? 'FAQ diperbarui.' : 'FAQ ditambahkan.') }
  catch (galat) { pesan.value = (galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'FAQ belum dapat disimpan.' }
  finally { sedangSimpan.value = false }
}
async function hapus() {
  if (!idHapus.value) return
  try { await kelola.hapusFaq(idHapus.value); await refresh(); toast.success('FAQ dihapus.') }
  catch (galat) { toast.error((galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'FAQ belum dapat dihapus.') }
  finally { idHapus.value = '' }
}
async function geser(index: number, arah: -1 | 1) {
  const items = data.value ?? []
  const tujuan = index + arah
  if (tujuan < 0 || tujuan >= items.length) return
  try {
    // Berurutan (bukan Promise.all) agar bila langkah kedua gagal, kegagalan terdeteksi jelas.
    await kelola.ubahUrutanFaq(items[index]!.id, items[tujuan]!.urutan)
    await kelola.ubahUrutanFaq(items[tujuan]!.id, items[index]!.urutan)
  } catch (galat) { toast.error((galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Urutan FAQ belum dapat diubah.') }
  finally { await refresh() }
}
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Kelola FAQ" deskripsi="Informasi keimigrasian yang tampil di halaman Informasi masyarakat.">
      <template #aksi>
        <Button as-child variant="outline"><NuxtLink to="/informasi" target="_blank" rel="noopener noreferrer" class="no-underline">Lihat halaman publik<ExternalLink class="size-4" /></NuxtLink></Button>
        <Button @click="tambah"><Plus class="size-4" />Tambah FAQ</Button>
      </template>
    </DashboardKepalaHalaman>
    <p class="flex items-start gap-2 rounded-lg border border-destructive/25 bg-bahaya-muda px-4 py-3 text-sm text-destructive" role="note"><Globe class="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span><strong>Semua FAQ langsung tampil ke publik.</strong> Isi hanya setelah siap dan jangan memuat informasi internal.</span></p>

    <div v-if="pending"><DashboardStateMemuat :baris="4" tinggi="h-24" /></div>
    <DashboardStateGalat v-else-if="error" pesan="FAQ belum dapat dimuat." @coba="refresh()" />
    <DashboardStateKosong v-else-if="!data?.length" judul="Belum ada FAQ." deskripsi="Tambahkan pertanyaan pertama untuk masyarakat." :ikon="BookOpenText"><Button @click="tambah"><Plus class="size-4" />Tambah FAQ</Button></DashboardStateKosong>
    <ol v-else class="grid gap-3">
      <li v-for="(item, index) in data" :key="item.id" class="group flex gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-xs transition hover:border-primary/25 sm:p-5">
        <div class="flex shrink-0 flex-col items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Naikkan urutan" :disabled="index === 0" @click="geser(index, -1)"><ChevronUp class="size-4" /></Button>
          <span class="grid size-7 place-items-center rounded-full bg-primary/8 text-xs font-semibold text-primary tabular-nums" :title="`Urutan ${item.urutan}`">{{ index + 1 }}</span>
          <Button variant="ghost" size="icon-sm" aria-label="Turunkan urutan" :disabled="index === data.length - 1" @click="geser(index, 1)"><ChevronDown class="size-4" /></Button>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-foreground">{{ item.pertanyaan }}</h3>
          <p class="mt-1.5 line-clamp-3 text-sm leading-6 whitespace-pre-line text-muted-foreground">{{ item.jawaban }}</p>
        </div>
        <div class="flex shrink-0 items-start gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Ubah FAQ" @click="ubah(item)"><Pencil class="size-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger as-child><Button variant="ghost" size="icon-sm" class="text-destructive hover:bg-bahaya-muda hover:text-destructive" aria-label="Hapus FAQ"><Trash2 class="size-4" /></Button></AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus FAQ?</AlertDialogTitle><AlertDialogDescription>“{{ item.pertanyaan }}” akan dihapus dan tidak lagi tampil kepada masyarakat.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="idHapus = item.id; hapus()">Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
        </div>
      </li>
    </ol>

    <Dialog v-model:open="bukaDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{{ isian.id ? 'Ubah FAQ' : 'Tambah FAQ' }}</DialogTitle><DialogDescription>Jawaban disimpan sebagai teks biasa; baris baru dipertahankan.</DialogDescription></DialogHeader>
        <div class="grid gap-4">
          <label class="grid gap-1.5 text-sm font-medium"><span class="flex justify-between">Pertanyaan<span class="font-normal text-muted-foreground tabular-nums">{{ isian.pertanyaan.length }}/250</span></span><Input v-model="isian.pertanyaan" maxlength="250" required /></label>
          <label class="grid gap-1.5 text-sm font-medium"><span class="flex justify-between">Jawaban<span class="font-normal text-muted-foreground tabular-nums">{{ isian.jawaban.length }}/5000</span></span><Textarea v-model="isian.jawaban" maxlength="5000" rows="8" required /></label>
          <label class="grid max-w-40 gap-1.5 text-sm font-medium">Urutan<Input v-model.number="isian.urutan" type="number" min="0" step="1" required /></label>
          <p v-if="pesan" class="rounded-md bg-bahaya-muda px-3 py-2 text-sm text-destructive" role="alert">{{ pesan }}</p>
        </div>
        <DialogFooter><Button variant="outline" @click="bukaDialog = false">Batal</Button><Button :disabled="sedangSimpan" @click="simpan">{{ sedangSimpan ? 'Menyimpan…' : 'Simpan FAQ' }}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
