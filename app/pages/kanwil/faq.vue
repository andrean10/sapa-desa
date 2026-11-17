<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ExternalLink, MoveDown, MoveUp, Pencil, Plus, Trash2 } from '@lucide/vue'
import { useKelolaKanwil } from '~/composables/useKelolaKanwil'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', title: 'Kelola FAQ' })
const kelola = useKelolaKanwil()
const { data, pending, error, refresh } = await useAsyncData('kanwil-faq', () => kelola.daftarFaq())
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
  <div class="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 sm:gap-6">
    <header class="flex min-w-0 flex-col gap-4 border-l-2 border-accent py-1 pl-4 sm:flex-row sm:items-end sm:justify-between"><div class="min-w-0 space-y-1"><p class="text-sm font-semibold text-muted-foreground">Konten publik</p><h1 class="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Pertanyaan yang sering diajukan</h1><p class="text-sm leading-6 text-muted-foreground">Konten ini langsung tampil di halaman informasi masyarakat.</p></div><div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><Button class="w-full sm:w-auto" as-child variant="outline"><NuxtLink to="/informasi" target="_blank" rel="noopener noreferrer">Lihat halaman publik<ExternalLink class="ml-2 size-4" /></NuxtLink></Button><Button class="w-full sm:w-auto" @click="tambah"><Plus class="mr-2 size-4" />Tambah FAQ</Button></div></header>
    <Alert variant="destructive"><AlertTitle>Periksa isi sebelum menyimpan</AlertTitle><AlertDescription>Semua FAQ langsung tampil ke publik. Pastikan jawaban sudah siap dan tidak memuat informasi internal.</AlertDescription></Alert>
    <Card><CardHeader><CardTitle>Daftar FAQ</CardTitle><CardDescription>{{ data?.length ?? 0 }} pertanyaan · Atur urutan dengan tombol panah.</CardDescription></CardHeader><CardContent><div v-if="pending" class="grid gap-3"><Skeleton v-for="i in 4" :key="i" class="h-24 w-full" /></div><div v-else-if="error" class="grid gap-3 text-sm text-destructive" role="alert">FAQ belum dapat dimuat.<Button class="w-fit" variant="outline" @click="refresh()">Coba lagi</Button></div><ol v-else class="grid gap-3"><li v-for="(item, index) in (data ?? [])" :key="item.id" class="rounded-lg border bg-card p-4"><div class="flex flex-wrap items-start justify-between gap-4"><div class="min-w-0 flex-1"><p class="mb-2 text-xs font-medium text-muted-foreground">Urutan {{ item.urutan }}</p><h3 class="font-semibold">{{ item.pertanyaan }}</h3><p class="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{{ item.jawaban }}</p></div><div class="flex shrink-0 gap-1"><Button variant="ghost" size="icon" aria-label="Naikkan urutan" :disabled="index === 0" @click="geser(index, -1)"><MoveUp class="size-4" /></Button><Button variant="ghost" size="icon" aria-label="Turunkan urutan" :disabled="index === (data?.length ?? 0) - 1" @click="geser(index, 1)"><MoveDown class="size-4" /></Button><Button variant="ghost" size="icon" aria-label="Ubah FAQ" @click="ubah(item)"><Pencil class="size-4" /></Button><AlertDialog><AlertDialogTrigger as-child><Button variant="ghost" size="icon" aria-label="Hapus FAQ"><Trash2 class="size-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus FAQ?</AlertDialogTitle><AlertDialogDescription>“{{ item.pertanyaan }}” akan dihapus dan tidak lagi tampil kepada masyarakat.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="idHapus = item.id; hapus()">Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div></li><li v-if="!data?.length" class="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Belum ada FAQ. Tambahkan pertanyaan pertama.</li></ol></CardContent></Card>
    <Dialog v-model:open="bukaDialog"><DialogContent class="sm:max-w-2xl"><DialogHeader><DialogTitle>{{ isian.id ? 'Ubah FAQ' : 'Tambah FAQ' }}</DialogTitle><DialogDescription>Jawaban disimpan sebagai teks biasa; baris baru akan dipertahankan.</DialogDescription></DialogHeader><div class="grid gap-4"><label class="grid gap-2 text-sm font-medium">Pertanyaan · {{ isian.pertanyaan.length }}/250<Input v-model="isian.pertanyaan" maxlength="250" required /></label><label class="grid gap-2 text-sm font-medium">Jawaban · {{ isian.jawaban.length }}/5000<Textarea v-model="isian.jawaban" maxlength="5000" rows="8" required /></label><label class="grid max-w-40 gap-2 text-sm font-medium">Urutan<Input v-model.number="isian.urutan" type="number" min="0" step="1" required /></label><p v-if="pesan" class="text-sm text-destructive" role="alert">{{ pesan }}</p></div><DialogFooter><Button variant="outline" @click="bukaDialog = false">Batal</Button><Button :disabled="sedangSimpan" @click="simpan">{{ sedangSimpan ? 'Menyimpan…' : 'Simpan FAQ' }}</Button></DialogFooter></DialogContent></Dialog>
  </div>
</template>
