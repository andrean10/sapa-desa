<script setup lang="ts">
import { formatTanggalWib } from '~~/shared/utils/waktu'

definePageMeta({ layout: 'dashboard', title: 'Profil Kantor' })
const { data, pending, error, refresh } = await useProfilUpt()
</script>

<template>
  <div class="grid gap-5">
    <header><h2 class="text-2xl font-extrabold text-primary">Profil Kantor</h2><p class="mt-1 text-muted-foreground">Informasi kantor, wilayah kerja, dan petugas PIMPASA.</p></header>
    <p v-if="pending" class="rounded-xl border border-border bg-card p-5" role="status">Memuat profil kantor...</p>
    <div v-else-if="error" class="rounded-xl border border-border bg-card p-5" role="alert"><p>Profil kantor belum dapat dimuat.</p><Button class="mt-3 underline" type="button" @click="refresh()">Coba lagi</Button></div>
    <template v-else-if="data">
      <div class="grid gap-5 lg:grid-cols-2">
        <section class="rounded-xl border border-border bg-card p-5 shadow-card"><h3 class="text-lg font-bold text-primary">Kantor</h3><p class="mt-3 font-semibold">{{ data.kantor.nama }}</p><p class="text-sm text-muted-foreground">{{ data.kantor.nama_singkat }} · Akun {{ data.username }}</p></section>
        <section class="rounded-xl border border-border bg-card p-5 shadow-card"><h3 class="text-lg font-bold text-primary">Wilayah kerja</h3><div class="mt-3 flex flex-wrap gap-2"><span v-for="item in data.kabupaten" :key="item.id" class="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{{ item.jenis }} {{ item.nama }}</span><p v-if="!data.kabupaten.length" class="text-sm text-muted-foreground">Belum ada wilayah kerja.</p></div></section>
      </div>
      <section class="rounded-xl border border-border bg-card p-5 shadow-card"><h3 class="text-lg font-bold text-primary">Petugas PIMPASA</h3><p v-if="!data.pimpasa.length" class="mt-3 text-muted-foreground">Belum ada petugas PIMPASA yang ditetapkan.</p><div v-else class="mt-4 overflow-x-auto"><Table class="w-full min-w-[520px] text-left text-sm"><TableHeader class="bg-muted"><TableRow><TableHead class="p-3">Pegawai</TableHead><TableHead class="p-3">Desa binaan</TableHead><TableHead class="p-3">Bertugas sejak</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="(item, index) in data.pimpasa" :key="`${item.pegawai_id}-${item.desa_id}-${index}`" class="border-t border-border"><TableCell class="p-3 font-semibold">{{ item.pegawai }}</TableCell><TableCell class="p-3">{{ item.desa }}</TableCell><TableCell class="p-3">{{ formatTanggalWib(item.tanggal_mulai) }}</TableCell></TableRow></TableBody></Table></div></section>
      <NuxtLink class="inline-flex min-h-11 items-center justify-self-start rounded-lg border border-border px-4 font-semibold text-primary no-underline" to="/akun/password">Ganti password</NuxtLink>
    </template>
  </div>
</template>
