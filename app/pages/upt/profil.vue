<script setup lang="ts">
import { Building2, KeyRound, MapPinned, UserRoundCog } from '@lucide/vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { formatTanggalWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Profil Kantor' })
const { data, pending, error, refresh } = await useProfilUpt()
</script>

<template>
  <div class="grid gap-5">
    <DashboardKepalaHalaman judul="Profil kantor" deskripsi="Informasi kantor, wilayah kerja, dan petugas PIMPASA.">
      <template #aksi><p class="flex items-center gap-1.5 text-xs text-muted-foreground"><KeyRound class="size-3.5 shrink-0" aria-hidden="true" />Untuk mengganti password, hubungi admin.</p></template>
    </DashboardKepalaHalaman>
    <div v-if="pending"><DashboardStateMemuat :baris="3" tinggi="h-32" /></div>
    <DashboardStateGalat v-else-if="error" pesan="Profil kantor belum dapat dimuat." @coba="refresh()" />
    <template v-else-if="data">
      <div class="grid gap-4 lg:grid-cols-2">
        <section class="flex gap-4 rounded-xl border border-border/80 bg-linear-to-br from-primary/[0.06] to-card p-5 shadow-xs">
          <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden="true"><Building2 class="size-6" /></span>
          <div class="min-w-0"><p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Kantor</p><h2 class="mt-1 text-lg font-semibold">{{ data.kantor.nama }}</h2><p class="text-sm text-muted-foreground">{{ data.kantor.nama_singkat }} · akun <span class="font-mono">{{ data.username }}</span></p></div>
        </section>
        <section class="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
          <p class="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><MapPinned class="size-4" aria-hidden="true" />Wilayah kerja</p>
          <div class="mt-3 flex flex-wrap gap-2"><span v-for="item in data.kabupaten" :key="item.id" class="rounded-full border bg-muted/40 px-3 py-1 text-sm font-medium"><span class="capitalize text-muted-foreground">{{ item.jenis }}</span> {{ item.nama }}</span><p v-if="!data.kabupaten.length" class="text-sm text-muted-foreground">Belum ada wilayah kerja.</p></div>
        </section>
      </div>
      <DashboardKartuBagian judul="Petugas PIMPASA" :deskripsi="`${data.pimpasa.length} penugasan berlaku. Penugasan diatur oleh Kanwil.`" rapat>
        <div v-if="!data.pimpasa.length" class="border-t p-5"><DashboardStateKosong judul="Belum ada petugas PIMPASA yang ditetapkan." :ikon="UserRoundCog" ringkas /></div>
        <DashboardBingkaiTabel v-else polos>
          <Table class="min-w-[640px]">
            <TableHeader><TableRow><TableHead>Pegawai</TableHead><TableHead>Desa binaan</TableHead><TableHead>Kecamatan</TableHead><TableHead>Kabupaten/Kota</TableHead><TableHead>Bertugas sejak</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in data.pimpasa" :key="`${item.pegawai_id}-${item.desa_id}-${index}`"><TableCell class="font-medium">{{ item.pegawai }}</TableCell><TableCell>{{ item.desa }}</TableCell><TableCell class="text-muted-foreground">{{ item.kecamatan }}</TableCell><TableCell class="text-muted-foreground">{{ item.kabupaten }}</TableCell><TableCell class="tabular-nums">{{ formatTanggalWib(item.tanggal_mulai) }}</TableCell></TableRow>
            </TableBody>
          </Table>
        </DashboardBingkaiTabel>
      </DashboardKartuBagian>
    </template>
  </div>
</template>
