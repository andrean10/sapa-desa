<template>
  <main class="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8 sm:py-14">
    <div class="mx-auto max-w-5xl">
      <header class="flex items-center justify-between gap-5">
        <div><p class="font-extrabold tracking-widest text-secondary">{{ APP_NAME }}</p><h1 class="mt-2 text-3xl font-black text-primary">Selamat datang, {{ profil?.nama_tampil }}</h1></div>
        <button class="min-h-11 rounded-lg border border-border bg-white px-4 font-bold text-primary hover:border-primary" type="button" @click="keluar">Keluar</button>
      </header>
      <section class="mt-8 rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
        <h2 class="text-xl font-extrabold text-primary">{{ namaPeran }}</h2>
        <p class="mt-3 leading-7 text-muted">Akses akun berhasil diverifikasi. Modul dashboard sesuai peran akan tersedia pada tahap berikutnya.</p>
        <p v-if="profil?.peran === 'upt'" class="mt-4 text-foreground">Bertugas atas nama: <strong>{{ namaPegawai || 'pegawai terpilih' }}</strong></p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { APP_NAME } from '~~/shared/config/app'
import { PERAN_PENGGUNA } from '~~/shared/config/teks'

const { profil, keluar, pegawaiBertugasId, daftarPegawai } = useAuth()
const namaPegawai = ref('')
const namaPeran = computed(() => PERAN_PENGGUNA.find(item => item.value === profil.value?.peran)?.label ?? 'Akun')

onMounted(async () => {
  if (profil.value?.peran !== 'upt' || !pegawaiBertugasId.value) return
  const pegawai = await daftarPegawai().catch(() => [])
  namaPegawai.value = pegawai.find(item => item.id === pegawaiBertugasId.value)?.nama ?? ''
})
</script>
