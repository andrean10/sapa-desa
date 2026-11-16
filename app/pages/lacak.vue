<template>
  <main class="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8 sm:py-16">
    <div class="mx-auto max-w-3xl">
      <NuxtLink class="font-extrabold text-primary no-underline" to="/">← {{ APP_NAME }}</NuxtLink>
      <p class="mt-10 text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Pelayanan masyarakat</p>
      <h1 class="mt-2 text-4xl font-black tracking-tight text-primary">Lacak laporan</h1>
      <p class="mt-3 text-muted">Masukkan kode pelacakan yang diberikan setelah laporan dikirim.</p>

      <form class="mt-7 grid gap-4 rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8" @submit.prevent="cari">
        <label class="font-semibold" for="kode">Kode pelacakan</label>
        <input id="kode" v-model="kode" class="min-h-12 rounded-lg border border-border px-3 outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" :placeholder="FORMAT_KODE_PELACAKAN" autocomplete="off" required>
        <button class="min-h-12 rounded-lg bg-primary px-5 font-bold text-white transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60" type="submit" :disabled="sedangMemuat">
          {{ sedangMemuat ? 'Memuat status…' : 'Lacak laporan' }}
        </button>
        <p v-if="pesanError" class="rounded-lg bg-background p-3 text-destructive" role="alert">{{ pesanError }}</p>
      </form>

      <section v-if="hasil" class="mt-6 rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8" aria-live="polite">
        <dl class="grid gap-5 sm:grid-cols-2">
          <div><dt class="text-sm text-muted">Kode</dt><dd class="mt-1 font-bold tracking-wider text-primary">{{ hasil.kode_pelacakan }}</dd></div>
          <div><dt class="text-sm text-muted">Status saat ini</dt><dd class="mt-1 font-bold text-primary">{{ labelStatus(hasil.status) }}</dd></div>
          <div><dt class="text-sm text-muted">Kantor penanganan</dt><dd class="mt-1 font-semibold">{{ hasil.kantor }}</dd></div>
          <div><dt class="text-sm text-muted">Dikirim</dt><dd class="mt-1 font-semibold">{{ formatWaktu(hasil.dikirim_pada) }}</dd></div>
        </dl>
        <h2 class="mt-9 text-xl font-extrabold text-primary">Riwayat laporan</h2>
        <ol class="mt-4">
          <li v-for="(item, index) in hasil.timeline" :key="`${item.waktu}-${item.status}-${index}`" class="grid gap-1 border-t border-border py-4 sm:grid-cols-[170px_1fr] sm:gap-5">
            <time class="text-sm text-muted" :datetime="item.waktu">{{ formatWaktu(item.waktu) }}</time>
            <div><strong class="text-primary">{{ labelStatus(item.status) }}</strong><p v-if="item.keterangan" class="mt-1 whitespace-pre-wrap leading-6 text-muted">{{ item.keterangan }}</p></div>
          </li>
        </ol>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { APP_NAME, FORMAT_KODE_PELACAKAN, STATUS_LAPORAN, TIMEZONE } from '~~/shared/config/app'
import type { Enums } from '~~/shared/types/database.types'

const { lacak } = useLacakLaporan()
const kode = ref('')
const hasil = ref<Awaited<ReturnType<typeof lacak>>>()
const sedangMemuat = ref(false)
const pesanError = ref('')

function labelStatus(status: Enums<'status_laporan'>) {
  return STATUS_LAPORAN.find(item => item.value === status)?.label ?? status
}

function formatWaktu(waktu: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: TIMEZONE }).format(new Date(waktu))
}

async function cari() {
  sedangMemuat.value = true
  pesanError.value = ''
  hasil.value = undefined
  try {
    hasil.value = await lacak(kode.value)
  } catch (error) {
    pesanError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Laporan belum dapat ditemukan.')
      : 'Status laporan belum dapat dimuat. Periksa koneksi lalu coba lagi.'
  } finally {
    sedangMemuat.value = false
  }
}
</script>
