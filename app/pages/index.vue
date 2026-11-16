<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
      <NuxtLink class="flex items-center gap-3 font-extrabold text-primary no-underline" to="/" :aria-label="APP_NAME + ' - beranda'">
        <span class="grid size-11 place-items-center rounded-xl rounded-bl-sm bg-primary text-white" aria-hidden="true">SD</span>
        <span>{{ APP_NAME }}<small class="mt-1 block text-xs font-medium text-muted">{{ REGIONAL_OFFICE_NAME }}</small></span>
      </NuxtLink>
      <nav class="flex items-center gap-3 sm:gap-6" aria-label="Navigasi utama">
        <NuxtLink class="font-semibold text-foreground no-underline hover:text-secondary" to="#faq">FAQ</NuxtLink>
        <NuxtLink class="rounded-lg border border-border px-3 py-2 font-semibold text-primary no-underline hover:bg-background" to="/lacak">Lacak laporan</NuxtLink>
      </nav>
    </header>

    <main>
      <section class="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.3fr_.7fr] lg:gap-16">
        <div class="max-w-3xl">
          <p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">{{ ORGANIZATION_NAME }}</p>
          <h1 class="mt-4 text-4xl font-black leading-[1.06] tracking-tight text-primary sm:text-6xl">Layanan keimigrasian lebih dekat dengan masyarakat Riau.</h1>
          <p class="mt-5 max-w-2xl text-lg leading-8 text-muted">{{ APP_TAGLINE }} Sampaikan pengaduan dan pantau tindak lanjutnya menggunakan kode pelacakan.</p>
          <div class="mt-7 flex flex-wrap gap-3">
            <NuxtLink class="inline-flex min-h-12 items-center gap-4 rounded-lg bg-primary px-5 py-3 font-bold text-white no-underline shadow-card transition hover:bg-secondary" to="/lapor">Buat laporan <span aria-hidden="true">→</span></NuxtLink>
            <NuxtLink class="inline-flex min-h-12 items-center rounded-lg border border-border bg-white px-5 py-3 font-bold text-primary no-underline hover:border-primary" to="/lacak">Lacak laporan</NuxtLink>
          </div>
          <p class="mt-4 text-sm text-muted">Pengiriman laporan memerlukan izin lokasi GPS.</p>
        </div>

        <aside class="relative overflow-hidden rounded-2xl bg-primary p-7 text-white shadow-card sm:p-9" aria-label="Informasi layanan">
          <div class="pointer-events-none absolute -right-2 -top-8 text-8xl font-black tracking-tighter text-secondary" aria-hidden="true">RIAU</div>
          <p class="relative mt-8 text-sm text-white">Kanal pengaduan masyarakat</p>
          <h2 class="relative mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">Informasi wilayah membantu laporan sampai ke kantor yang tepat.</h2>
          <p class="relative mt-4 leading-7 text-white">Pilih kabupaten, kecamatan, dan desa/kelurahan saat mengisi laporan. Sistem menentukan kantor imigrasi yang menangani wilayah tersebut.</p>
        </aside>
      </section>

      <section class="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 md:grid-cols-3" aria-label="Cara menggunakan layanan">
        <article class="border-t-4 border-accent bg-white p-6 shadow-sm"><span class="font-black text-accent">01</span><h2 class="mt-3 font-bold text-primary">Kirim laporan</h2><p class="mt-2 leading-6 text-muted">Isi informasi pengaduan dan aktifkan lokasi perangkat Anda.</p></article>
        <article class="border-t-4 border-accent bg-white p-6 shadow-sm"><span class="font-black text-accent">02</span><h2 class="mt-3 font-bold text-primary">Simpan kode</h2><p class="mt-2 leading-6 text-muted">Setelah dikirim, simpan kode pelacakan yang muncul.</p></article>
        <article class="border-t-4 border-accent bg-white p-6 shadow-sm"><span class="font-black text-accent">03</span><h2 class="mt-3 font-bold text-primary">Pantau status</h2><p class="mt-2 leading-6 text-muted">Gunakan kode tersebut untuk melihat status dan timeline laporan.</p></article>
      </section>

      <section id="faq" class="scroll-mt-8 bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div class="mx-auto max-w-7xl">
          <p class="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Pusat informasi</p>
          <h2 class="mt-2 text-3xl font-black text-primary sm:text-4xl">Pertanyaan yang sering diajukan</h2>
          <p class="mt-3 text-muted">Informasi singkat seputar layanan keimigrasian.</p>

          <div v-if="pending" class="mt-8 rounded-xl border border-border p-5 text-muted" role="status">Memuat FAQ…</div>
          <div v-else-if="error" class="mt-8 rounded-xl border border-destructive bg-background p-5 text-destructive" role="alert">FAQ belum dapat dimuat. Silakan coba muat ulang halaman.</div>
          <div v-else-if="!faq.length" class="mt-8 rounded-xl border border-border p-5 text-muted">Belum ada informasi FAQ yang tersedia.</div>
          <div v-else class="mt-8 divide-y divide-border border-y border-border">
            <details v-for="item in faq" :key="item.id" class="group py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-primary [&::-webkit-details-marker]:hidden">
                {{ item.pertanyaan }}<span class="text-xl text-accent transition group-open:rotate-45" aria-hidden="true">＋</span>
              </summary>
              <p class="mt-4 max-w-4xl whitespace-pre-wrap leading-7 text-muted">{{ item.jawaban }}</p>
            </details>
          </div>
        </div>
      </section>
    </main>

    <footer class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-sm sm:px-8">
      <NuxtLink class="font-extrabold text-primary no-underline" to="/">{{ APP_NAME }}</NuxtLink>
      <p class="text-muted">{{ REGIONAL_OFFICE_NAME }}</p>
      <NuxtLink class="font-semibold text-foreground no-underline hover:text-secondary" to="/lacak">Lacak laporan</NuxtLink>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { APP_NAME, APP_TAGLINE, ORGANIZATION_NAME, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'

const { data, pending, error } = await useFaq()
const faq = computed(() => data.value ?? [])
</script>
