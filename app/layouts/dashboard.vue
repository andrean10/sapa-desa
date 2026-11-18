<script setup lang="ts">
import { Eye, ShieldAlert, UserRoundCheck } from '@lucide/vue'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { Separator } from '~/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { APP_NAME } from '~~/shared/config/app'
import { buatGayaTemaDashboard } from '~~/shared/config/tema'
import { TEKS_UMUM } from '~~/shared/config/teks'

const { profil, keluar, pegawaiBertugasId, daftarPegawai } = useAuth()
const akunImpersonasi = useCookie<string | null>('sapa-impersonasi')
const konfigurasi = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { data: statusAdmin } = await useAsyncData('admin-status', () => profil.value?.peran === 'admin' ? useApi()<{ validasi_lokasi_aktif: boolean; akun_admin: number; akun_kanwil: number; akun_upt: number; akun_nonaktif: number }>('/api/admin/status') : Promise.resolve(null), { lazy: true, watch: [() => profil.value?.peran], default: () => null })
const lihatSebagaiUpt = computed(() => profil.value?.peran === 'kanwil' || profil.value?.peran === 'admin')
const { data: opsiKantor } = await useAsyncData('kanwil-lihat-sebagai-upt', () => lihatSebagaiUpt.value ? useApi()<{ id: string; nama_singkat: string }[]>('/api/kanwil/kantor') : Promise.resolve([] as { id: string; nama_singkat: string }[]), { lazy: true, watch: [lihatSebagaiUpt], default: () => [] })
const kantorDipilih = ref('')
watch(() => route.path, (path) => { kantorDipilih.value = path.match(/^\/kanwil\/upt\/([^/]+)/)?.[1] ?? '' }, { immediate: true })
watch(kantorDipilih, (kantorId) => { if (kantorId && route.path !== `/kanwil/upt/${kantorId}`) router.push(`/kanwil/upt/${kantorId}`) })

// Remah roti: kelompok menu › menu, atau menu › halaman turunan (detail).
const remahRoti = computed(() => {
  const judul = (route.meta.title as string | undefined) ?? APP_NAME
  const aktif = profil.value ? cariMenuAktif(route.path, profil.value.peran) : null
  if (!aktif) return { induk: null, judul }
  if (aktif.item.href === route.path) return { induk: { label: aktif.grup.label, href: null }, judul: aktif.item.label }
  return { induk: { label: aktif.item.label, href: aktif.item.href }, judul }
})

const namaPegawai = ref('')
watchEffect(async () => {
  if (!pegawaiBertugasId.value || profil.value?.peran !== 'upt') { namaPegawai.value = ''; return }
  const daftar = await daftarPegawai().catch(() => [])
  namaPegawai.value = daftar.find(item => item.id === pegawaiBertugasId.value)?.nama ?? ''
})

const konfirmasiLogoutTerbuka = ref(false)
async function logout() {
  konfirmasiLogoutTerbuka.value = false
  await keluar()
}
useHead({
  titleTemplate: title => title ? `${title} · ${APP_NAME}` : APP_NAME,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  bodyAttrs: { style: buatGayaTemaDashboard() }
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar variant="inset" :nama-petugas="namaPegawai" @keluar="konfirmasiLogoutTerbuka = true" />
    <SidebarInset class="min-w-0">
      <header class="sticky top-0 z-20 flex h-14 min-w-0 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-4 md:rounded-t-xl lg:px-6">
        <SidebarTrigger class="-ml-1 size-8 shrink-0" />
        <Separator orientation="vertical" class="mx-1 hidden data-[orientation=vertical]:h-4 sm:block" />
        <Breadcrumb class="min-w-0 flex-1">
          <BreadcrumbList class="min-w-0 flex-nowrap">
            <template v-if="remahRoti.induk">
              <BreadcrumbItem class="hidden md:inline-flex">
                <BreadcrumbLink v-if="remahRoti.induk.href" as-child><NuxtLink :to="remahRoti.induk.href" class="no-underline">{{ remahRoti.induk.label }}</NuxtLink></BreadcrumbLink>
                <span v-else>{{ remahRoti.induk.label }}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
            </template>
            <BreadcrumbItem class="min-w-0"><BreadcrumbPage class="block truncate font-medium">{{ remahRoti.judul }}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <NuxtLink v-if="profil?.peran === 'upt'" to="/upt/pilih-petugas" class="hidden max-w-64 items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground no-underline transition hover:border-primary/40 hover:text-foreground md:inline-flex" :title="TEKS_UMUM.gantiPetugas">
          <UserRoundCheck class="size-3.5 shrink-0 text-sukses" aria-hidden="true" /><span class="truncate">Bertugas: <strong class="font-medium text-foreground">{{ namaPegawai || 'Pilih petugas' }}</strong></span>
        </NuxtLink>
        <div v-if="lihatSebagaiUpt" class="relative flex shrink-0 items-center">
          <Eye class="pointer-events-none absolute left-2.5 z-10 size-3.5 text-muted-foreground" aria-hidden="true" />
          <label for="lihat-sebagai-upt" class="sr-only">Lihat sebagai UPT</label>
          <NativeSelect id="lihat-sebagai-upt" v-model="kantorDipilih" class="h-8 w-34 bg-card pl-8 text-xs sm:w-48">
            <NativeSelectOption value="">Lihat sebagai UPT</NativeSelectOption>
            <NativeSelectOption v-for="kantor in opsiKantor" :key="kantor.id" :value="kantor.id">{{ kantor.nama_singkat }}</NativeSelectOption>
          </NativeSelect>
        </div>
        <MenuPengguna :nama-petugas="namaPegawai" @keluar="konfirmasiLogoutTerbuka = true" />
      </header>
      <AlertDialog v-model:open="konfirmasiLogoutTerbuka">
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Logout dari {{ APP_NAME }}?</AlertDialogTitle><AlertDialogDescription>Anda perlu login kembali untuk melanjutkan pekerjaan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="logout">Logout</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div v-if="konfigurasi.public.appMode === 'test' || akunImpersonasi || (profil?.peran === 'admin' && statusAdmin && !statusAdmin.validasi_lokasi_aktif) || $slots.banner" class="grid gap-2 px-4 pt-4 lg:px-8">
        <BannerGlobal :mode-uji="konfigurasi.public.appMode === 'test'" />
        <div v-if="profil?.peran === 'admin' && statusAdmin && !statusAdmin.validasi_lokasi_aktif" class="flex items-center gap-2 rounded-lg border border-destructive bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground" role="alert"><ShieldAlert class="size-4 shrink-0" aria-hidden="true" />Validasi lokasi dimatikan. Laporan dari luar Riau dapat masuk. Hidupkan kembali setelah pengujian.</div>
        <div v-if="akunImpersonasi" class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-bahaya-muda px-4 py-2 text-sm font-semibold text-destructive" role="status"><span>Anda masuk sebagai {{ akunImpersonasi }}</span><Button size="sm" variant="outline" class="bg-card" @click="konfirmasiLogoutTerbuka = true">Logout</Button></div>
        <slot name="banner" />
      </div>
      <main class="mx-auto w-full max-w-screen-2xl min-w-0 flex-1 px-4 py-5 sm:py-6 lg:px-8"><slot /></main>
    </SidebarInset>
  </SidebarProvider>
</template>
