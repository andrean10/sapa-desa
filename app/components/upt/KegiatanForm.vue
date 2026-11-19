<script setup lang="ts">
import {
  CalendarDays,
  CircleAlert,
  ExternalLink,
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  TriangleAlert,
  Users,
  X,
} from "@lucide/vue";
import { toast } from "vue-sonner";
import { BATAS_FILE } from "~~/shared/config/batas-file";
import { labelPemrosesAduan } from "~~/shared/utils/jabatan";
import { tanggalHariIniWib } from "~~/shared/utils/waktu";
import { kompresFoto } from "~/utils/foto";

const props = withDefaults(
  defineProps<{
    id?: string;
    desaIdAwal?: string;
  }>(),
  {
    id: "",
    desaIdAwal: "",
  },
);

const emit = defineEmits<{ tersimpan: []; tutup: [] }>();
const { opsi, detail, buat, unggah, bersihkan, ubah } = useKegiatanUpt();
// Tanpa await: form ini dibuka di dalam dialog, dan setup async di sana butuh <Suspense>. Data tampil reaktif saat sudah siap.
const { data: profilKantor } = useProfilUpt();

const pilihan = ref<{
  desa: { desa_id: string; desa: string; kecamatan: string }[];
  pegawai: { id: string; nama: string }[];
  jenis: { id: string; nama: string }[];
  penugasan: {
    pegawai_id: string;
    desa_id: string;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
  }[];
}>({ desa: [], pegawai: [], jenis: [], penugasan: [] });
const isian = reactive({
  tanggal_kegiatan: tanggalHariIniWib(),
  desa_id: props.desaIdAwal,
  pegawai_id: "",
  petugas_pengganti_nama: "",
  jenis_kegiatan_id: "",
  jumlah_peserta: undefined as number | undefined,
  uraian_hasil: "",
  pdf_path: "",
});
const lampiranTersimpan = ref<{ pdf_url: string | null }>({ pdf_url: null });
const MAKS_FOTO = BATAS_FILE.foto.maksimumJumlahKegiatan;
// Foto yang sudah tersimpan di laporan (mode ubah) dan foto baru yang menunggu diunggah.
const fotoTersimpan = ref<{ path: string; url: string }[]>([]);
const fotoBaru = ref<{ file: File; pratinjau: string }[]>([]);
const jumlahFoto = computed(() => fotoTersimpan.value.length + fotoBaru.value.length);
const pdf = ref<File>();
const inputFoto = ref<HTMLInputElement>();
const inputPdf = ref<HTMLInputElement>();
const pesan = ref("");
const memuat = ref(true);
const sibuk = ref(false);
const progresFoto = ref<number | null>(null);
const progresPdf = ref<number | null>(null);
const galatFoto = ref("");
const galatPeserta = ref("");
const PESAN_PESERTA = "Jumlah peserta minimal 1 orang.";
const pesertaValid = () => Number.isInteger(isian.jumlah_peserta) && (isian.jumlah_peserta ?? 0) >= 1;
const galatPdf = ref("");
const infoKompres = ref("");
const pratinjauPdf = ref("");

const modeUbah = computed(() => Boolean(props.id));
// Petugas hanya boleh PIMPASA yang ditugaskan di desa itu pada tanggal kegiatan (SK Kanwil bersifat tetap).
// Yang menggantikan karena berhalangan ditulis bebas di "Petugas Pengganti". Aturan ini juga dijaga database.
const petugasPimpasa = computed(() =>
  isian.desa_id
    ? pilihan.value.pegawai.filter((pegawai) =>
        pilihan.value.penugasan.some(
          (item) =>
            item.desa_id === isian.desa_id &&
            item.pegawai_id === pegawai.id &&
            item.tanggal_mulai <= isian.tanggal_kegiatan &&
            (!item.tanggal_selesai ||
              item.tanggal_selesai >= isian.tanggal_kegiatan),
        ),
      )
    : [],
);
const tanpaPimpasa = computed(
  () => Boolean(isian.desa_id) && !memuat.value && petugasPimpasa.value.length === 0,
);
const jabatanPemroses = computed(() => labelPemrosesAduan(profilKantor.value?.kantor?.nama));
const pegawaiAsli = ref("");
// Satu PIMPASA: terpilih otomatis dan dikunci. Beberapa: pilih salah satu. Saat mengubah laporan lama, petugas aslinya dipertahankan.
watch(
  [() => isian.desa_id, () => isian.tanggal_kegiatan, petugasPimpasa],
  () => {
    const daftar = petugasPimpasa.value;
    if (daftar.length === 1) isian.pegawai_id = daftar[0]!.id;
    else if (
      !daftar.some((item) => item.id === isian.pegawai_id) &&
      !(modeUbah.value && isian.pegawai_id === pegawaiAsli.value)
    )
      isian.pegawai_id = "";
  },
);

onMounted(async () => {
  try {
    pilihan.value = await opsi();
    if (props.id) {
      const kegiatan = await detail(props.id);
      Object.assign(isian, kegiatan);
      isian.petugas_pengganti_nama = kegiatan.petugas_pengganti_nama ?? "";
      pegawaiAsli.value = kegiatan.pegawai_id;
      lampiranTersimpan.value = { pdf_url: kegiatan.pdf_url };
      fotoTersimpan.value = kegiatan.foto_paths.map((path, i) => ({
        path,
        url: kegiatan.foto_urls[i] ?? "",
      }));
    }
  } catch {
    pesan.value = "Pilihan form kegiatan belum dapat dimuat.";
  } finally {
    memuat.value = false;
  }
});

onBeforeUnmount(() => {
  fotoBaru.value.forEach((item) => URL.revokeObjectURL(item.pratinjau));
  if (pratinjauPdf.value) URL.revokeObjectURL(pratinjauPdf.value);
});

// Galat lampiran ditampilkan tepat di bawah kolomnya (dialog bisa tergulir, jadi alert di atas form sering tidak terlihat) dan juga lewat toast.
function tolakLampiran(
  jenis: "foto" | "pdf",
  input: HTMLInputElement,
  teks: string,
) {
  if (jenis === "foto") galatFoto.value = teks;
  else galatPdf.value = teks;
  input.value = "";
  toast.error(teks);
}

async function pilihFoto(event: Event) {
  const input = event.target as HTMLInputElement;
  const dipilih = Array.from(input.files ?? []);
  galatFoto.value = "";
  infoKompres.value = "";
  if (!dipilih.length) return;
  const sisa = MAKS_FOTO - jumlahFoto.value;
  const diproses = dipilih.slice(0, Math.max(sisa, 0));
  let dikecilkan = 0;
  try {
    for (const file of diproses) {
      const hasil = await kompresFoto(file);
      if (hasil.size < file.size) dikecilkan++;
      fotoBaru.value.push({ file: hasil, pratinjau: URL.createObjectURL(hasil) });
    }
    if (dikecilkan)
      infoKompres.value = `${dikecilkan} foto dikecilkan otomatis.`;
    if (dipilih.length > diproses.length)
      galatFoto.value = `Maksimal ${MAKS_FOTO} foto. Foto yang melebihi batas tidak ditambahkan.`;
    pesan.value = "";
  } catch (error) {
    tolakLampiran(
      "foto",
      input,
      error instanceof Error ? error.message : "Foto belum dapat diproses.",
    );
  }
  input.value = "";
}

function pilihPdf(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  galatPdf.value = "";
  if (!file) return;
  if (file.type !== "application/pdf") {
    pdf.value = undefined;
    tolakLampiran("pdf", input, "File harus berformat PDF.");
    return;
  }
  if (file.size > BATAS_FILE.pdf.ukuranMaksimumByte) {
    pdf.value = undefined;
    tolakLampiran(
      "pdf",
      input,
      `Ukuran PDF ${ukuranFile(file.size)} melebihi batas 8 MB. Kecilkan file lalu pilih lagi.`,
    );
    return;
  }
  pdf.value = file;
  if (pratinjauPdf.value) URL.revokeObjectURL(pratinjauPdf.value);
  pratinjauPdf.value = URL.createObjectURL(file);
  pesan.value = "";
}

function hapusFotoBaru(indeks: number) {
  const [dibuang] = fotoBaru.value.splice(indeks, 1);
  if (dibuang) URL.revokeObjectURL(dibuang.pratinjau);
  galatFoto.value = "";
  infoKompres.value = "";
}

function hapusFotoTersimpan(indeks: number) {
  fotoTersimpan.value.splice(indeks, 1);
  galatFoto.value = "";
}

function hapusPdfPilihan() {
  pdf.value = undefined;
  galatPdf.value = "";
  if (pratinjauPdf.value) URL.revokeObjectURL(pratinjauPdf.value);
  pratinjauPdf.value = "";
  if (inputPdf.value) inputPdf.value.value = "";
}

const ukuranFile = (byte: number) =>
  byte >= 1024 * 1024
    ? `${(byte / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(byte / 1024)} KB`;

async function simpan() {
  if (!pesertaValid()) {
    galatPeserta.value = PESAN_PESERTA;
    const kolom = document.getElementById("kegiatan-peserta");
    kolom?.scrollIntoView({ block: "center", behavior: "smooth" });
    kolom?.focus({ preventScroll: true });
    return;
  }
  galatPeserta.value = "";
  sibuk.value = true;
  pesan.value = "";
  const unggahanBaru: { foto_paths: string[]; pdf_path?: string } = { foto_paths: [] };
  try {
    for (const [indeks, item] of fotoBaru.value.entries()) {
      progresFoto.value = Math.round((indeks / fotoBaru.value.length) * 100);
      const hasil = await unggah(item.file, "foto", (persen) => {
        progresFoto.value = Math.round(
          ((indeks + persen / 100) / fotoBaru.value.length) * 100,
        );
      });
      unggahanBaru.foto_paths.push(hasil.path);
    }
    if (pdf.value) {
      progresPdf.value = 0;
      isian.pdf_path = (
        await unggah(pdf.value, "pdf", (persen) => (progresPdf.value = persen))
      ).path;
      unggahanBaru.pdf_path = isian.pdf_path;
    }
    const payload = {
      tanggal_kegiatan: isian.tanggal_kegiatan,
      pegawai_id: isian.pegawai_id,
      jenis_kegiatan_id: isian.jenis_kegiatan_id,
      jumlah_peserta: isian.jumlah_peserta as number,
      uraian_hasil: isian.uraian_hasil,
      petugas_pengganti_nama: isian.petugas_pengganti_nama.trim(),
      ...((modeUbah.value || unggahanBaru.foto_paths.length || fotoTersimpan.value.length) && {
        foto_paths: [
          ...fotoTersimpan.value.map((item) => item.path),
          ...unggahanBaru.foto_paths,
        ],
      }),
      ...(isian.pdf_path && { pdf_path: isian.pdf_path }),
    };
    if (props.id) await ubah(props.id, payload);
    else await buat({ ...payload, desa_id: isian.desa_id });
    toast.success(
      modeUbah.value
        ? "Laporan kegiatan diperbarui."
        : "Laporan kegiatan tersimpan.",
    );
    emit("tersimpan");
  } catch (error) {
    if (unggahanBaru.foto_paths.length || unggahanBaru.pdf_path)
      await bersihkan(unggahanBaru).catch(() => undefined);
    pesan.value =
      (error as { data?: { statusMessage?: string } })?.data?.statusMessage ??
      "Laporan belum dapat disimpan.";
  } finally {
    sibuk.value = false;
    progresFoto.value = null;
    progresPdf.value = null;
  }
}
</script>

<template>
  <form class="grid gap-8" @submit.prevent="simpan">
    <div
      v-if="memuat"
      class="flex items-center gap-2 text-sm text-muted-foreground"
      role="status"
    >
      <LoaderCircle class="size-4 animate-spin" />Memuat pilihan form…
    </div>
    <Alert v-if="pesan" variant="destructive" role="alert">
      <CircleAlert />
      <AlertDescription>{{ pesan }}</AlertDescription>
    </Alert>

    <fieldset :disabled="memuat || sibuk" class="min-w-0 disabled:opacity-60">
      <FieldGroup class="gap-8">
        <FieldSet>
          <FieldLegend>Informasi kegiatan</FieldLegend>
          <FieldDescription
            >Kantor:
            <span class="font-medium text-foreground">{{
              profilKantor?.kantor?.nama ?? "Memuat…"
            }}</span></FieldDescription
          >
          <FieldGroup class="gap-5">
            <Field>
              <FieldLabel for="kegiatan-desa"
                ><MapPin class="size-4 text-muted-foreground" />Desa
                binaan</FieldLabel
              >
              <NativeSelect
                id="kegiatan-desa"
                v-model="isian.desa_id"
                class="h-11"
                required
                :disabled="modeUbah"
              >
                <NativeSelectOption value=""
                  >Pilih desa binaan</NativeSelectOption
                >
                <NativeSelectOption
                  v-for="item in pilihan.desa"
                  :key="item.desa_id"
                  :value="item.desa_id"
                  >{{ item.desa }} — {{ item.kecamatan }}</NativeSelectOption
                >
              </NativeSelect>
              <FieldDescription v-if="modeUbah"
                >Desa tidak dapat diubah setelah laporan
                dibuat.</FieldDescription
              >
            </Field>
            <div class="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel for="kegiatan-tanggal"
                  ><CalendarDays class="size-4 text-muted-foreground" />Tanggal
                  kegiatan</FieldLabel
                >
                <Input
                  id="kegiatan-tanggal"
                  v-model="isian.tanggal_kegiatan"
                  class="h-11"
                  type="date"
                  :max="tanggalHariIniWib()"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="kegiatan-jenis">Jenis kegiatan</FieldLabel>
                <NativeSelect
                  id="kegiatan-jenis"
                  v-model="isian.jenis_kegiatan_id"
                  class="h-11"
                  required
                >
                  <NativeSelectOption value=""
                    >Pilih jenis kegiatan</NativeSelectOption
                  >
                  <NativeSelectOption
                    v-for="item in pilihan.jenis"
                    :key="item.id"
                    :value="item.id"
                    >{{ item.nama }}</NativeSelectOption
                  >
                </NativeSelect>
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Pelaksana</FieldLegend>
          <FieldGroup class="gap-5">
            <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_12rem]">
              <Field>
                <FieldLabel for="kegiatan-petugas"
                  ><Users
                    class="size-4 text-muted-foreground"
                  />Petugas PIMPASA</FieldLabel
                >
                <NativeSelect
                  id="kegiatan-petugas"
                  v-model="isian.pegawai_id"
                  class="h-11"
                  required
                  :disabled="!isian.desa_id || petugasPimpasa.length <= 1"
                >
                  <NativeSelectOption value="">{{
                    !isian.desa_id
                      ? "Pilih desa binaan terlebih dahulu"
                      : petugasPimpasa.length
                        ? "Pilih petugas"
                        : "Belum ada PIMPASA aktif"
                  }}</NativeSelectOption>
                  <NativeSelectOption
                    v-for="item in petugasPimpasa"
                    :key="item.id"
                    :value="item.id"
                    >{{ item.nama }}</NativeSelectOption
                  >
                </NativeSelect>
                <FieldDescription
                  >Hanya PIMPASA yang ditugaskan di desa ini (sesuai SK
                  Kanwil).</FieldDescription
                >
              </Field>
              <Field>
                <FieldLabel for="kegiatan-peserta">Jumlah peserta</FieldLabel>
                <Input
                  id="kegiatan-peserta"
                  v-model.number="isian.jumlah_peserta"
                  class="h-11"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  max="100000"
                  step="1"
                  placeholder="Contoh: 25"
                  required
                  :aria-invalid="Boolean(galatPeserta)"
                  @input="galatPeserta = ''"
                  @invalid.prevent="galatPeserta = PESAN_PESERTA"
                />
                <p v-if="galatPeserta" class="text-sm font-medium text-destructive" role="alert">{{ galatPeserta }}</p>
              </Field>
            </div>
            <Alert v-if="tanpaPimpasa" variant="destructive">
              <TriangleAlert />
              <AlertTitle>Belum ada PIMPASA aktif</AlertTitle>
              <AlertDescription
                >Desa ini belum memiliki PIMPASA yang bertugas pada tanggal
                tersebut. Hubungi Kanwil untuk penugasan PIMPASA.</AlertDescription
              >
            </Alert>
            <Field>
              <FieldLabel for="kegiatan-pengganti"
                >Petugas Pengganti
                <span class="font-normal text-muted-foreground"
                  >(opsional)</span
                ></FieldLabel
              >
              <Input
                id="kegiatan-pengganti"
                v-model="isian.petugas_pengganti_nama"
                class="h-11"
                maxlength="150"
                autocomplete="off"
                placeholder="Nama petugas pengganti"
              />
              <FieldDescription
                >Isi hanya bila PIMPASA berhalangan (cuti, sakit, dan
                sebagainya) dan kegiatan dilakukan petugas lain atas perintah
                {{ jabatanPemroses }}. Kosongkan bila PIMPASA sendiri yang
                terjun.</FieldDescription
              >
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Hasil kegiatan</FieldLegend>
          <Field>
            <FieldLabel for="kegiatan-uraian"
              >Uraian, hasil, dan tindak lanjut</FieldLabel
            >
            <Textarea
              id="kegiatan-uraian"
              v-model="isian.uraian_hasil"
              class="min-h-36 resize-y"
              minlength="10"
              maxlength="5000"
              required
              placeholder="Tuliskan apa yang dilakukan, hasilnya, dan tindak lanjut bila ada."
            />
            <FieldDescription class="flex justify-between gap-3"
              ><span>Minimal 10 karakter.</span
              ><span class="tabular-nums"
                >{{ isian.uraian_hasil.length }}/5000</span
              ></FieldDescription
            >
          </Field>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend
            >Dokumentasi
            <span class="font-normal text-muted-foreground"
              >(opsional)</span
            ></FieldLegend
          >
          <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Field class="min-w-0">
              <FieldLabel for="kegiatan-foto"
                ><ImagePlus class="size-4 text-primary" />Foto
                kegiatan (maks. 3)</FieldLabel
              >
              <div
                class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 overflow-hidden rounded-lg border border-dashed bg-muted/30 p-4"
              >
                <input
                  id="kegiatan-foto"
                  ref="inputFoto"
                  class="block w-full min-w-0 max-w-full truncate text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground disabled:opacity-50"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="jumlahFoto >= MAKS_FOTO"
                  @change="pilihFoto"
                />
                <FieldDescription class="min-w-0"
                  >JPEG, PNG, atau WebP. Maksimal {{ MAKS_FOTO }} foto
                  ({{ jumlahFoto }}/{{ MAKS_FOTO }}). Ukuran foto disesuaikan
                  otomatis saat diunggah.</FieldDescription
                >
                <p
                  v-if="galatFoto"
                  class="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {{ galatFoto }}
                </p>
                <p
                  v-if="infoKompres"
                  class="text-sm text-muted-foreground"
                  role="status"
                >
                  {{ infoKompres }}
                </p>
                <Progress
                  v-if="progresFoto !== null"
                  :model-value="progresFoto"
                />
                <ul v-if="jumlahFoto" class="grid min-w-0 gap-2">
                  <li
                    v-for="(item, indeks) in fotoTersimpan"
                    :key="item.path"
                    class="flex min-w-0 items-center gap-3"
                  >
                    <a
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="shrink-0"
                      ><img
                        :src="item.url"
                        class="size-16 rounded-md border object-cover"
                        :alt="`Foto tersimpan ${indeks + 1}`"
                    /></a>
                    <div class="min-w-0 flex-1 text-sm">
                      <p class="truncate font-medium">Foto tersimpan {{ indeks + 1 }}</p>
                      <p class="text-muted-foreground">Sudah ada di laporan</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Hapus foto tersimpan ${indeks + 1}`"
                      @click="hapusFotoTersimpan(indeks)"
                      ><X class="size-4"
                    /></Button>
                  </li>
                  <li
                    v-for="(item, indeks) in fotoBaru"
                    :key="item.pratinjau"
                    class="flex min-w-0 items-center gap-3"
                  >
                    <img
                      :src="item.pratinjau"
                      class="size-16 shrink-0 rounded-md border object-cover"
                      :alt="`Pratinjau foto baru ${indeks + 1}`"
                    />
                    <div class="min-w-0 flex-1 text-sm">
                      <p class="truncate font-medium">{{ item.file.name }}</p>
                      <p class="text-muted-foreground">
                        {{ ukuranFile(item.file.size) }}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Hapus foto baru ${indeks + 1}`"
                      @click="hapusFotoBaru(indeks)"
                      ><X class="size-4"
                    /></Button>
                  </li>
                </ul>
              </div>
            </Field>
            <Field class="min-w-0">
              <FieldLabel for="kegiatan-pdf"
                ><FileText class="size-4 text-primary" />Laporan PDF</FieldLabel
              >
              <div
                class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 overflow-hidden rounded-lg border border-dashed bg-muted/30 p-4"
              >
                <input
                  id="kegiatan-pdf"
                  ref="inputPdf"
                  class="block w-full min-w-0 max-w-full truncate text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                  type="file"
                  accept="application/pdf"
                  @change="pilihPdf"
                />
                <FieldDescription>Format PDF. Maksimal 8 MB.</FieldDescription>
                <p
                  v-if="galatPdf"
                  class="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {{ galatPdf }}
                </p>
                <Progress
                  v-if="progresPdf !== null"
                  :model-value="progresPdf"
                />
                <div v-if="pdf" class="flex min-w-0 items-center gap-3">
                  <FileText class="size-8 shrink-0 text-muted-foreground" />
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium">{{ pdf.name }}</p>
                    <p class="text-muted-foreground">
                      {{ ukuranFile(pdf.size) }}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Hapus PDF yang dipilih"
                    @click="hapusPdfPilihan"
                    ><X class="size-4"
                  /></Button>
                </div>
                <iframe
                  v-if="pdf && pratinjauPdf"
                  :src="pratinjauPdf"
                  class="h-72 w-full max-w-full rounded-md border bg-background"
                  title="Pratinjau laporan PDF"
                />
                <template v-else-if="lampiranTersimpan.pdf_url">
                  <iframe
                    :src="lampiranTersimpan.pdf_url"
                    class="h-72 w-full max-w-full rounded-md border bg-background"
                    title="Pratinjau laporan PDF tersimpan"
                  />
                  <a
                    class="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4"
                    :href="lampiranTersimpan.pdf_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    ><ExternalLink class="size-3.5" />Buka PDF di tab baru</a
                  >
                </template>
              </div>
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </fieldset>

    <div
      class="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end"
    >
      <Button
        type="button"
        variant="outline"
        :disabled="sibuk"
        @click="emit('tutup')"
        >Batal</Button
      >
      <Button type="submit" :disabled="memuat || sibuk || tanpaPimpasa">
        <LoaderCircle v-if="sibuk" class="size-4 animate-spin" />{{
          sibuk
            ? "Menyimpan…"
            : modeUbah
              ? "Simpan perubahan"
              : "Simpan laporan"
        }}
      </Button>
    </div>
  </form>
</template>
