<script setup lang="ts">
import { APP_NAME, MENU_PERAN } from '~~/shared/config/app'
import { PERAN_PENGGUNA, TEKS_UMUM } from '~~/shared/config/teks'

const { profil, keluar, pegawaiBertugasId, daftarPegawai } = useAuth()
const konfigurasi = useRuntimeConfig()
const route = useRoute()
const menu = computed(() => MENU_PERAN[profil.value?.peran ?? 'upt'])
const labelPeran = computed(() => PERAN_PENGGUNA.find(peran => peran.value === profil.value?.peran)?.label ?? '')
const namaPegawai = ref('')

watchEffect(async () => {
  const pegawaiId = pegawaiBertugasId.value
  if (!pegawaiId || profil.value?.peran !== 'upt') {
    namaPegawai.value = ''
    return
  }
  const pegawai = await daftarPegawai().catch(() => [])
  namaPegawai.value = pegawai.find(item => item.id === pegawaiId)?.nama ?? ''
})

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[16rem_1fr]">
    <aside class="bg-sidebar px-4 py-5 text-sidebar-foreground">
      <NuxtLink class="mb-6 block px-3 text-lg font-extrabold text-sidebar-foreground no-underline" to="/">
        {{ APP_NAME }}
      </NuxtLink>
      <nav class="grid gap-1" aria-label="Menu dashboard">
        <NuxtLink
          v-for="item in menu"
          :key="item.href"
          :to="item.href"
          class="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          :class="route.path === item.href ? 'border-l-4 border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'"
          :aria-current="route.path === item.href ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <div class="min-w-0">
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-5 py-4 sm:px-8">
        <div>
          <h1 class="text-xl font-extrabold text-primary">{{ route.meta.title ?? menu[0]?.label }}</h1>
          <nav class="mt-1 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <NuxtLink class="text-muted-foreground no-underline hover:text-primary" to="/">{{ TEKS_UMUM.beranda }}</NuxtLink>
            <span aria-hidden="true">/</span>
            <span>{{ route.meta.title ?? menu[0]?.label }}</span>
          </nav>
          <p class="mt-1 text-sm text-muted-foreground">{{ profil?.nama_tampil }}<span v-if="labelPeran"> · {{ labelPeran }}</span></p>
          <p v-if="profil?.peran === 'upt' && namaPegawai" class="mt-1 text-sm font-semibold text-secondary-foreground">
            Bertugas: {{ namaPegawai }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink class="text-sm font-semibold text-primary no-underline" to="/akun/password">{{ TEKS_UMUM.gantiPassword }}</NuxtLink>
          <button class="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold" type="button" @click="keluar">
            {{ TEKS_UMUM.keluar }}
          </button>
        </div>
      </header>

      <div class="px-5 pt-5 sm:px-8">
        <BannerGlobal :mode-uji="konfigurasi.public.appMode === 'test'" />
        <slot name="banner" />
      </div>

      <main class="p-5 sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
