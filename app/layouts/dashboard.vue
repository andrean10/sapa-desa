<script setup lang="ts">
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { Separator } from '~/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { APP_NAME } from '~~/shared/config/app'
import { PERAN_PENGGUNA, TEKS_UMUM } from '~~/shared/config/teks'

const { profil, keluar, pegawaiBertugasId, daftarPegawai } = useAuth()
const akunImpersonasi = useCookie<string | null>('sapa-impersonasi')
const konfigurasi = useRuntimeConfig()
const route = useRoute()
const { data: statusAdmin } = await useAsyncData('admin-status', () => profil.value?.peran === 'admin' ? useApi()< { validasi_lokasi_aktif: boolean; akun_admin: number; akun_kanwil: number; akun_upt: number; akun_nonaktif: number }>('/api/admin/status') : Promise.resolve(null), { watch: [() => profil.value?.peran], default: () => null })
const namaPegawai = ref('')
const lihatSebagaiUpt = computed(() => profil.value?.peran === 'kanwil' || profil.value?.peran === 'admin')
const { data: opsiKantor } = await useAsyncData('kanwil-lihat-sebagai-upt', () => lihatSebagaiUpt.value ? useApi()< { id: string; nama_singkat: string }[]>('/api/kanwil/kantor') : Promise.resolve([] as { id: string; nama_singkat: string }[]), { watch: [lihatSebagaiUpt], default: () => [] })
const kantorDipilih = ref('')
watch(() => route.path, (path) => { kantorDipilih.value = path.match(/^\/kanwil\/upt\/([^/]+)/)?.[1] ?? '' }, { immediate: true })
const router = useRouter()
watch(kantorDipilih, (kantorId) => { if (kantorId && route.path !== `/kanwil/upt/${kantorId}`) router.push(`/kanwil/upt/${kantorId}`) })
const labelPeran = computed(() => PERAN_PENGGUNA.find(item => item.value === profil.value?.peran)?.label ?? '')
const konfirmasiLogoutTerbuka = ref(false)
async function logout() {
  konfirmasiLogoutTerbuka.value = false
  await keluar()
}
watchEffect(async () => {
  if (!pegawaiBertugasId.value || profil.value?.peran !== 'upt') { namaPegawai.value = ''; return }
  const daftar = await daftarPegawai().catch(() => [])
  namaPegawai.value = daftar.find(item => item.id === pegawaiBertugasId.value)?.nama ?? ''
})
useHead({ titleTemplate: title => title ? `${title} · ${APP_NAME}` : APP_NAME, meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <SidebarProvider>
    <AppSidebar variant="inset" />
    <SidebarInset class="min-w-0">
      <header class="sticky top-0 z-20 flex min-h-16 min-w-0 shrink-0 items-center gap-2 border-b border-border/70 bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-4 sm:px-6">
        <SidebarTrigger class="size-10 shrink-0 rounded-xl border border-border bg-card shadow-sm transition hover:bg-muted" />
        <Separator orientation="vertical" class="hidden h-6 sm:block" />
        <Breadcrumb class="min-w-0 flex-1 overflow-hidden">
          <BreadcrumbList class="min-w-0"><BreadcrumbItem class="min-w-0"><BreadcrumbPage class="block truncate font-semibold">{{ route.meta.title ?? APP_NAME }}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList>
        </Breadcrumb>
        <span class="hidden max-w-48 truncate text-sm text-muted-foreground lg:block">{{ profil?.nama_tampil }}<template v-if="labelPeran"> · {{ labelPeran }}</template></span>
        <label v-if="lihatSebagaiUpt" class="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground xl:flex">Lihat sebagai UPT<NativeSelect v-model="kantorDipilih" class="h-9 w-44"><NativeSelectOption value="">Pilih kantor</NativeSelectOption><NativeSelectOption v-for="kantor in opsiKantor" :key="kantor.id" :value="kantor.id">{{ kantor.nama_singkat }}</NativeSelectOption></NativeSelect></label>
        <NativeSelect v-if="lihatSebagaiUpt" v-model="kantorDipilih" class="h-9 w-32 min-w-0 text-xs xl:hidden sm:w-40"><NativeSelectOption value="">Pilih UPT</NativeSelectOption><NativeSelectOption v-for="kantor in opsiKantor" :key="kantor.id" :value="kantor.id">{{ kantor.nama_singkat }}</NativeSelectOption></NativeSelect>
        <Button class="h-10 shrink-0 rounded-xl px-3 font-semibold" variant="outline" size="sm" @click="konfirmasiLogoutTerbuka = true">{{ TEKS_UMUM.keluar }}</Button>
      </header>
      <AlertDialog v-model:open="konfirmasiLogoutTerbuka">
        <AlertDialogContent class="border-primary/20">
          <AlertDialogHeader><AlertDialogTitle>Logout dari SAPA DESA?</AlertDialogTitle><AlertDialogDescription>Anda perlu login kembali untuk melanjutkan pekerjaan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="logout">Logout</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div class="space-y-3 px-4 pt-4 md:px-6"><BannerGlobal :mode-uji="konfigurasi.public.appMode === 'test'" /><div v-if="profil?.peran === 'admin' && statusAdmin && !statusAdmin.validasi_lokasi_aktif" class="rounded-lg border border-destructive bg-destructive px-4 py-3 font-semibold text-destructive-foreground" role="alert">Validasi lokasi dimatikan. Laporan dari luar Riau dapat masuk. Hidupkan kembali setelah pengujian.</div><slot name="banner" /></div>
      <div v-if="akunImpersonasi" class="mx-4 mt-3 flex items-center justify-between gap-4 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive md:mx-6" role="status"><span>Anda masuk sebagai {{ akunImpersonasi }}</span><Button size="sm" variant="outline" @click="konfirmasiLogoutTerbuka = true">Logout</Button></div>
      <p v-if="profil?.peran === 'upt'" class="mx-4 mt-3 rounded-lg border bg-card px-4 py-2 text-sm text-muted-foreground md:mx-6">Bertugas atas nama <strong class="text-foreground">{{ namaPegawai || 'Pilih petugas' }}</strong><NuxtLink class="ml-2 font-medium text-primary underline underline-offset-4" to="/upt/pilih-petugas">{{ TEKS_UMUM.gantiPetugas }}</NuxtLink></p>
      <main class="min-w-0 flex-1 p-4 md:p-6"><slot /></main>
    </SidebarInset>
  </SidebarProvider>
</template>
