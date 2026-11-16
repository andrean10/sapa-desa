<template>
  <main class="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8 sm:py-16">
    <div class="mx-auto max-w-md">
      <NuxtLink class="font-extrabold text-primary no-underline" to="/">← {{ APP_NAME }}</NuxtLink>
      <section class="mt-8 rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
        <p class="text-xs font-extrabold uppercase tracking-[.14em] text-secondary">{{ REGIONAL_OFFICE_NAME }}</p>
        <h1 class="mt-2 text-3xl font-black text-primary">{{ daftarPegawai ? 'Pilih petugas' : 'Masuk ke SAPA DESA' }}</h1>

        <form v-if="!daftarPegawai" class="mt-6 grid gap-3" @submit.prevent="submitLogin">
          <label class="mt-2 font-semibold" for="username">Username</label>
          <input id="username" v-model="username" class="min-h-12 rounded-lg border border-border px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary" autocomplete="username" required>
          <label class="mt-2 font-semibold" for="password">Kata sandi</label>
          <input id="password" v-model="password" class="min-h-12 rounded-lg border border-border px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary" type="password" autocomplete="current-password" required>
          <p class="text-sm leading-6 text-muted">Gunakan username dan kata sandi yang diberikan administrator.</p>
          <button class="mt-2 min-h-12 rounded-lg bg-primary px-5 font-bold text-white hover:bg-secondary disabled:cursor-wait disabled:opacity-60" type="submit" :disabled="sedangMemproses">
            {{ sedangMemproses ? 'Memeriksa akun…' : 'Masuk' }}
          </button>
        </form>

        <form v-else class="mt-6 grid gap-3" @submit.prevent="lanjutKeDashboard">
          <p class="leading-6 text-muted">Pilih pegawai aktif yang sedang bertugas atas nama akun UPT ini.</p>
          <label class="mt-2 font-semibold" for="pegawai">Bertugas atas nama</label>
          <select id="pegawai" v-model="pegawaiId" class="min-h-12 rounded-lg border border-border bg-white px-3" required>
            <option value="">Pilih pegawai</option>
            <option v-for="item in daftarPegawai" :key="item.id" :value="item.id">{{ item.nama }}</option>
          </select>
          <p v-if="!daftarPegawai.length" class="rounded-lg bg-background p-3 text-destructive">Belum ada pegawai aktif. Hubungi administrator untuk memperbarui daftar pegawai.</p>
          <button class="mt-2 min-h-12 rounded-lg bg-primary px-5 font-bold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50" type="submit" :disabled="!pegawaiId || sedangMemproses">Lanjutkan</button>
          <button class="min-h-10 font-semibold text-primary" type="button" @click="keluar">Keluar</button>
        </form>

        <p v-if="pesanError" class="mt-4 rounded-lg bg-background p-3 text-destructive" role="alert">{{ pesanError }}</p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PegawaiPilihan } from '~~/shared/types/auth'
import { APP_NAME, REGIONAL_OFFICE_NAME } from '~~/shared/config/app'

const { masuk, daftarPegawai: muatPegawai, keluar, muatProfil, profil, pegawaiBertugasId, pilihPegawai } = useAuth()
const route = useRoute()
const username = ref('')
const password = ref('')
const pegawaiId = ref('')
const daftarPegawai = ref<PegawaiPilihan[] | null>(null)
const sedangMemproses = ref(false)
const pesanError = ref('')

onMounted(async () => {
  const akun = await muatProfil()
  if (!akun) return
  if (akun.peran !== 'upt' || pegawaiBertugasId.value) {
    await navigateTo('/dashboard')
    return
  }
  if (route.query.pilih_petugas) await ambilPegawai()
})

async function ambilPegawai() {
  sedangMemproses.value = true
  try {
    daftarPegawai.value = await muatPegawai()
  } catch {
    pesanError.value = 'Daftar pegawai belum dapat dimuat. Silakan coba lagi.'
    daftarPegawai.value = []
  } finally {
    sedangMemproses.value = false
  }
}

async function submitLogin() {
  sedangMemproses.value = true
  pesanError.value = ''
  try {
    const hasil = await masuk(username.value, password.value)
    if (hasil.profil.peran === 'upt') {
      daftarPegawai.value = hasil.pegawai
      if (!hasil.pegawai.length) pesanError.value = 'Belum ada pegawai aktif. Hubungi administrator.'
    } else {
      await navigateTo('/dashboard')
    }
  } catch (error) {
    pesanError.value = error instanceof Error ? error.message : 'Login belum dapat diproses.'
  } finally {
    sedangMemproses.value = false
  }
}

async function lanjutKeDashboard() {
  if (!pegawaiId.value) return
  pilihPegawai(pegawaiId.value)
  await navigateTo('/dashboard')
}
</script>
