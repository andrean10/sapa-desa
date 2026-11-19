<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Building2, CalendarDays, Download, FileText, MapPinned, Trash2, UserRound, UserRoundCog, Users } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import type { Tables } from '~~/shared/types/database.types'
import { formatTanggalWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Detail kegiatan PIMPASA' })
const route = useRoute()
const { profil } = useAuth()
const sedangHapus = ref(false)
async function hapus() {
  sedangHapus.value = true
  try { await useApi()(`/api/kanwil/kegiatan/${route.params.id}`, { method: 'DELETE' }); toast.success('Laporan kegiatan dihapus.'); await navigateTo('/kanwil/kegiatan') }
  catch (galat) { toast.error((galat as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Laporan kegiatan belum dapat dihapus.') }
  finally { sedangHapus.value = false }
}
type DetailKegiatan = Omit<Tables<'laporan_pimpasa'>, 'foto_paths' | 'pdf_path' | 'kantor_id'> & { kantor: string; desa: string; pegawai: string; jenis: string; foto_urls: string[]; pdf_url: string | null }
const { data, pending, error, refresh } = await useAsyncData<DetailKegiatan>(`kanwil-kegiatan-${route.params.id}`, () => useApi()<DetailKegiatan>(`/api/kanwil/kegiatan/${route.params.id}`), { lazy: true })
</script>

<template>
  <div class="grid gap-5">
    <NuxtLink to="/kanwil/kegiatan" class="w-fit text-sm font-medium text-muted-foreground no-underline hover:text-primary">← Kegiatan PIMPASA</NuxtLink>
    <div v-if="pending" class="grid gap-4"><Skeleton class="h-32 rounded-xl" /><Skeleton class="h-64 rounded-xl" /></div>
    <DashboardStateGalat v-else-if="error" pesan="Detail belum dapat dimuat." deskripsi="Periksa koneksi atau akses laporan kegiatan." @coba="refresh()" />
    <div v-else-if="data" class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
      <article class="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <header class="border-b bg-linear-to-br from-primary/[0.05] to-transparent p-5">
          <div class="flex flex-wrap items-center gap-2"><span class="rounded-md bg-emas/15 px-2 py-0.5 text-xs font-semibold text-emas-teks">{{ data.jenis }}</span><span v-if="data.petugas_pengganti_nama" class="rounded-full bg-peringatan-muda px-2 py-0.5 text-xs font-semibold text-peringatan">Dilakukan petugas pengganti</span></div>
          <h1 class="mt-2 text-xl font-semibold text-primary">Kegiatan di {{ data.desa }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ formatTanggalWib(data.tanggal_kegiatan) }} · {{ data.kantor }}</p>
        </header>
        <div class="p-5">
          <h2 class="text-sm font-semibold">Uraian, hasil, dan tindak lanjut</h2>
          <p class="mt-2 rounded-lg border-l-4 border-primary/25 bg-muted/25 p-4 leading-7 whitespace-pre-wrap">{{ data.uraian_hasil }}</p>
        </div>
      </article>
      <div class="grid gap-5">
        <section class="rounded-xl border border-border/80 bg-card shadow-xs">
          <h2 class="border-b px-5 py-4 font-semibold">Ringkasan</h2>
          <dl class="grid gap-4 p-5 text-sm">
            <div class="flex gap-3"><CalendarDays class="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" /><div><dt class="text-muted-foreground">Tanggal kegiatan</dt><dd class="font-medium">{{ formatTanggalWib(data.tanggal_kegiatan) }}</dd></div></div>
            <div class="flex gap-3"><Building2 class="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" /><div><dt class="text-muted-foreground">UPT</dt><dd class="font-medium">{{ data.kantor }}</dd></div></div>
            <div class="flex gap-3"><MapPinned class="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" /><div><dt class="text-muted-foreground">Desa binaan</dt><dd class="font-medium">{{ data.desa }}</dd></div></div>
            <div class="flex gap-3"><UserRound class="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" /><div><dt class="text-muted-foreground">Petugas PIMPASA</dt><dd class="font-medium">{{ data.pegawai }}</dd></div></div>
            <div v-if="data.petugas_pengganti_nama" class="flex gap-3"><UserRoundCog class="mt-0.5 size-4 text-peringatan" aria-hidden="true" /><div><dt class="text-muted-foreground">Petugas Pengganti</dt><dd class="font-medium">{{ data.petugas_pengganti_nama }}</dd></div></div>
            <div class="flex gap-3"><Users class="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" /><div><dt class="text-muted-foreground">Jumlah peserta</dt><dd class="font-medium tabular-nums">{{ data.jumlah_peserta }} orang</dd></div></div>
          </dl>
        </section>
        <section class="rounded-xl border border-border/80 bg-card shadow-xs">
          <h2 class="border-b px-5 py-4 font-semibold">Lampiran</h2>
          <div class="grid gap-3 p-5">
            <DashboardGaleriFoto :fotos="data.foto_urls" label="Foto dokumentasi kegiatan" />
            <Button v-if="data.pdf_url" variant="outline" as-child><a :href="data.pdf_url" target="_blank" rel="noopener noreferrer" class="no-underline"><FileText class="size-4" />Buka PDF laporan<Download class="ml-auto size-4" /></a></Button>
            <p v-if="!data.foto_urls.length && !data.pdf_url" class="text-sm text-muted-foreground">Tidak ada lampiran.</p>
          </div>
        </section>
        <section v-if="profil?.peran === 'admin'" class="rounded-xl border border-destructive/30 bg-card shadow-xs">
          <h2 class="border-b border-destructive/20 px-5 py-4 font-semibold text-destructive">Hapus laporan</h2>
          <div class="grid gap-3 p-5 text-sm">
            <p class="text-muted-foreground">Khusus admin. Laporan beserta foto dan PDF-nya dihapus permanen dan tidak dapat dikembalikan.</p>
            <AlertDialog>
              <AlertDialogTrigger as-child><Button variant="outline" class="w-fit border-destructive/40 text-destructive hover:bg-bahaya-muda hover:text-destructive" :disabled="sedangHapus"><Trash2 class="size-4" />Hapus laporan kegiatan</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Hapus laporan kegiatan ini?</AlertDialogTitle><AlertDialogDescription>Kegiatan di {{ data?.desa }} ({{ data ? formatTanggalWib(data.tanggal_kegiatan) : '' }}) akan dihapus permanen bersama lampirannya. Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="hapus">Hapus</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
