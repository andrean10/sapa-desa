<script setup lang="ts">
import { Check, LogOut, Search, UserRound } from "@lucide/vue";
import type { PegawaiPilihan } from "~~/shared/types/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

definePageMeta({ layout: false, title: "Pilih petugas" });
useHead({ meta: [{ name: "robots", content: "noindex, nofollow" }] });

const { muatProfil, daftarPegawai, pegawaiBertugasId, pilihPegawai, keluar } =
  useAuth();
const route = useRoute();
const konfirmasiLogoutTerbuka = ref(false);
const pegawai = ref<PegawaiPilihan[]>([]);
const terpilih = ref(pegawaiBertugasId.value ?? "");
const cari = ref("");
const memuat = ref(true);
const galat = ref("");

const hasilCari = computed(() => {
  const kataKunci = cari.value.trim().toLocaleLowerCase("id");
  return pegawai.value.filter((item) =>
    item.nama.toLocaleLowerCase("id").includes(kataKunci),
  );
});

const profil = await muatProfil();
if (!profil) await navigateTo("/masuk");
else if (profil.peran !== "upt") await navigateTo("/kanwil");

onMounted(async () => {
  try {
    pegawai.value = await daftarPegawai();
    // Pilihan dari cookie yang sudah tidak ada di daftar aktif (nonaktif/pindah kantor) dibuang.
    if (terpilih.value && !pegawai.value.some((item) => item.id === terpilih.value)) {
      terpilih.value = "";
      pegawaiBertugasId.value = null;
    }
  } catch {
    galat.value = "Daftar pegawai belum dapat dimuat.";
  } finally {
    memuat.value = false;
  }
});

function pilih(item: PegawaiPilihan) {
  terpilih.value = item.id;
}
function lanjut() {
  if (!terpilih.value) return;
  pilihPegawai(terpilih.value);
  const redirect =
    typeof route.query.redirect === "string" ? route.query.redirect : "";
  const tujuan =
    redirect.startsWith("/upt/") ||
    redirect === "/upt" ||
    redirect === "/akun/password"
      ? redirect
      : "/upt";
  void navigateTo(tujuan);
}
async function logout() {
  konfirmasiLogoutTerbuka.value = false;
  await keluar();
}
</script>

<template>
  <main
    class="flex min-h-svh items-center bg-background px-4 py-8 sm:px-8 lg:px-14 xl:px-20"
  >
    <section class="mx-auto flex min-w-0 w-full max-w-xl items-center">
      <div class="mx-auto grid w-full max-w-xl gap-6">
        <header class="grid gap-3 border-l-2 border-accent py-1 pl-4">
          <div
            class="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"
          >
            <UserRound class="size-5" />
          </div>
          <h1
            class="text-2xl font-bold tracking-tight text-primary sm:text-3xl"
          >
            Siapa yang bertugas hari ini?
          </h1>
          <p class="leading-6 text-muted-foreground">
            Pilih petugas aktif untuk melanjutkan ke dashboard.
          </p>
        </header>
        <div class="grid gap-2">
          <label
            class="text-sm font-semibold text-foreground"
            for="cari-pegawai"
            >Cari pegawai</label
          >
          <div class="relative">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            /><Input
              id="cari-pegawai"
              v-model="cari"
              class="h-11 pl-10 text-base"
              type="search"
              autocomplete="off"
              placeholder="Ketik nama pegawai"
            />
          </div>
        </div>
        <p
          v-if="memuat"
          class="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground"
          role="status"
        >
          Memuat daftar pegawai…
        </p>
        <div
          v-else-if="galat"
          class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm text-destructive"
          role="alert"
        >
          {{ galat }}
          <Button
            class="ml-1 h-auto px-0 text-destructive"
            type="button"
            variant="link"
            @click="$router.go(0)"
            >Muat ulang</Button
          >
        </div>
        <div
          v-else-if="!pegawai.length"
          class="rounded-lg border border-dashed bg-muted/50 px-4 py-5 text-sm"
        >
          <p>Belum ada pegawai aktif di kantor ini.</p>
          <Button class="mt-3 px-0" as-child variant="link"
            ><NuxtLink to="/upt/pegawai">Buka data pegawai</NuxtLink></Button
          >
        </div>
        <div
          v-else
          class="grid max-h-[min(24rem,45vh)] gap-2 overflow-y-auto pr-1"
          role="listbox"
          aria-label="Daftar petugas aktif"
        >
          <button
            v-for="item in hasilCari"
            :key="item.id"
            class="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            :class="
              terpilih === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:border-primary/50 hover:bg-muted/60'
            "
            type="button"
            role="option"
            :aria-selected="terpilih === item.id"
            @click="pilih(item)"
          >
            <span class="truncate">{{ item.nama }}</span
            ><Check v-if="terpilih === item.id" class="size-4 shrink-0" />
          </button>
          <p
            v-if="!hasilCari.length"
            class="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground"
          >
            Nama pegawai tidak ditemukan.
          </p>
        </div>
        <div class="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <div class="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              class="min-h-11 sm:min-h-10"
              type="button"
              variant="ghost"
              @click="konfirmasiLogoutTerbuka = true"
              ><LogOut class="size-4" />Logout</Button
            ><Button
              class="min-h-11 sm:min-h-10"
              type="button"
              :disabled="!terpilih || memuat"
              @click="lanjut"
              >Masuk ke dashboard</Button
            >
          </div>
        </div>
      </div>
    </section>
    <AlertDialog v-model:open="konfirmasiLogoutTerbuka"
      ><AlertDialogContent class="border-primary/20"
        ><AlertDialogHeader
          ><AlertDialogTitle>Logout dari SAPA DESA?</AlertDialogTitle
          ><AlertDialogDescription
            >Anda perlu login kembali untuk melanjutkan
            pekerjaan.</AlertDialogDescription
          ></AlertDialogHeader
        ><AlertDialogFooter
          ><AlertDialogCancel>Batal</AlertDialogCancel
          ><AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="logout"
            >Logout</AlertDialogAction
          ></AlertDialogFooter
        ></AlertDialogContent
      ></AlertDialog
    >
  </main>
</template>
