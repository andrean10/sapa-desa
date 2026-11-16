<script setup lang="ts">
import type { PegawaiPilihan } from '~~/shared/types/auth'
import { TEKS_UMUM } from '~~/shared/config/teks'

definePageMeta({ layout: 'dashboard', title: 'Pilih petugas' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const { muatProfil, daftarPegawai, pegawaiBertugasId, pilihPegawai, keluar } = useAuth()
const route = useRoute()
const profil = await muatProfil()
if (!profil) await navigateTo('/masuk')
else if (profil.peran !== 'upt') await navigateTo('/kanwil')
const pegawai = ref<PegawaiPilihan[]>([])
const terpilih = ref(pegawaiBertugasId.value ?? '')
const cari = ref('')
const memuat = ref(true)
const galat = ref('')
const hasilCari = computed(() => pegawai.value.filter(item => item.nama.toLocaleLowerCase('id').includes(cari.value.trim().toLocaleLowerCase('id'))))
onMounted(async () => {
  try { pegawai.value = await daftarPegawai() }
  catch { galat.value = 'Daftar pegawai belum dapat dimuat.' }
  finally { memuat.value = false }
})
function lanjut() {
  if (!terpilih.value) return
  pilihPegawai(terpilih.value)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  const tujuan = redirect.startsWith('/upt/') || redirect === '/upt' || redirect === '/akun/password' ? redirect : '/upt'
  void navigateTo(tujuan)
}
</script>

<template>
  <section class="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
    <h2 class="text-2xl font-extrabold text-primary">Bertugas atas nama siapa?</h2>
    <p class="mt-2 leading-6 text-muted-foreground">Nama Anda akan dicatat pada setiap perubahan yang dilakukan.</p>
    <label class="mt-6 grid gap-2 font-semibold" for="cari-pegawai">Cari pegawai<Input id="cari-pegawai" v-model="cari" class="min-h-11 rounded-lg border border-border bg-background px-3 text-base" type="search" /></label>
    <p v-if="memuat" class="mt-4 text-muted-foreground" role="status">Memuat daftar pegawai...</p>
    <p v-else-if="galat" class="mt-4 text-destructive" role="alert">{{ galat }} <Button class="underline" type="button" @click="$router.go(0)">{{ TEKS_UMUM.cobaLagi }}</Button></p>
    <div v-else-if="!pegawai.length" class="mt-5 rounded-lg bg-muted p-4"><p>Belum ada pegawai terdaftar di kantor Anda.</p><NuxtLink class="mt-3 inline-block font-bold text-primary underline" to="/upt/pegawai">Tambah pegawai</NuxtLink></div>
    <fieldset v-else class="mt-4 grid gap-2"><legend class="sr-only">Pilih petugas aktif</legend><label v-for="item in hasilCari" :key="item.id" class="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border px-4"><input v-model="terpilih" type="radio" name="pegawai" :value="item.id"><span>{{ item.nama }}</span></label><p v-if="!hasilCari.length" class="text-sm text-muted-foreground">Tidak ada nama yang cocok.</p></fieldset>
    <div class="mt-6 flex flex-wrap gap-3"><Button type="button" :disabled="!terpilih || memuat" @click="lanjut">Lanjut</Button><Button variant="ghost" type="button" @click="keluar">Keluar</Button></div>
  </section>
</template>
