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
const { pegawaiBertugasId } = useAuth();

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
  jenis_kegiatan_id: "",
  jumlah_peserta: 0,
  uraian_hasil: "",
  foto_path: "",
  pdf_path: "",
});
const lampiranTersimpan = ref<{
  foto_url: string | null;
  pdf_url: string | null;
}>({ foto_url: null, pdf_url: null });
const foto = ref<File>();
const pdf = ref<File>();
const inputFoto = ref<HTMLInputElement>();
const inputPdf = ref<HTMLInputElement>();
const pesan = ref("");
const memuat = ref(true);
const sibuk = ref(false);
const pratinjauFoto = ref("");
const progresFoto = ref<number | null>(null);
const progresPdf = ref<number | null>(null);
const galatFoto = ref("");
const galatPdf = ref("");
const infoKompres = ref("");
const pratinjauPdf = ref("");

const modeUbah = computed(() => Boolean(props.id));
const pegawaiPengganti = computed(
  () =>
    isian.desa_id &&
    isian.pegawai_id &&
    !pilihan.value.penugasan.some(
      (item) =>
        item.desa_id === isian.desa_id &&
        item.pegawai_id === isian.pegawai_id &&
        item.tanggal_mulai <= isian.tanggal_kegiatan &&
        (!item.tanggal_selesai ||
          item.tanggal_selesai >= isian.tanggal_kegiatan),
    ),
);

onMounted(async () => {
  try {
    pilihan.value = await opsi();
    isian.pegawai_id =
      pilihan.value.pegawai.find((item) => item.id === pegawaiBertugasId.value)
        ?.id ?? "";
    if (props.id) {
      const kegiatan = await detail(props.id);
      Object.assign(isian, kegiatan);
      lampiranTersimpan.value = {
        foto_url: kegiatan.foto_url,
        pdf_url: kegiatan.pdf_url,
      };
    }
  } catch {
    pesan.value = "Pilihan form kegiatan belum dapat dimuat.";
  } finally {
    memuat.value = false;
  }
});

onBeforeUnmount(() => {
  if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value);
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
  const file = input.files?.[0];
  galatFoto.value = "";
  infoKompres.value = "";
  if (!file) return;
  try {
    const hasil = await kompresFoto(file);
    foto.value = hasil;
    if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value);
    pratinjauFoto.value = URL.createObjectURL(hasil);
    if (hasil.size < file.size)
      infoKompres.value = `Foto dikecilkan otomatis dari ${ukuranFile(file.size)} menjadi ${ukuranFile(hasil.size)}.`;
    pesan.value = "";
  } catch (error) {
    foto.value = undefined;
    tolakLampiran(
      "foto",
      input,
      error instanceof Error ? error.message : "Foto belum dapat diproses.",
    );
  }
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

function hapusFotoPilihan() {
  foto.value = undefined;
  if (pratinjauFoto.value) URL.revokeObjectURL(pratinjauFoto.value);
  pratinjauFoto.value = "";
  infoKompres.value = "";
  galatFoto.value = "";
  if (inputFoto.value) inputFoto.value.value = "";
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
  sibuk.value = true;
  pesan.value = "";
  const unggahanBaru: { foto_path?: string; pdf_path?: string } = {};
  try {
    if (foto.value) {
      progresFoto.value = 0;
      isian.foto_path = (
        await unggah(
          foto.value,
          "foto",
          (persen) => (progresFoto.value = persen),
        )
      ).path;
      unggahanBaru.foto_path = isian.foto_path;
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
      jumlah_peserta: isian.jumlah_peserta,
      uraian_hasil: isian.uraian_hasil,
      ...(isian.foto_path && { foto_path: isian.foto_path }),
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
    if (unggahanBaru.foto_path || unggahanBaru.pdf_path)
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
                  />Petugas</FieldLabel
                >
                <NativeSelect
                  id="kegiatan-petugas"
                  v-model="isian.pegawai_id"
                  class="h-11"
                  required
                >
                  <NativeSelectOption value=""
                    >Pilih petugas</NativeSelectOption
                  >
                  <NativeSelectOption
                    v-for="item in pilihan.pegawai"
                    :key="item.id"
                    :value="item.id"
                    >{{ item.nama }}</NativeSelectOption
                  >
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel for="kegiatan-peserta">Jumlah peserta</FieldLabel>
                <Input
                  id="kegiatan-peserta"
                  v-model.number="isian.jumlah_peserta"
                  class="h-11"
                  type="number"
                  inputmode="numeric"
                  min="0"
                  max="100000"
                  required
                />
              </Field>
            </div>
            <Alert v-if="pegawaiPengganti">
              <TriangleAlert />
              <AlertTitle>Petugas pengganti</AlertTitle>
              <AlertDescription
                >Petugas ini bukan PIMPASA aktif pada desa dan tanggal yang
                dipilih. Sistem akan mencatatnya sebagai petugas
                pengganti.</AlertDescription
              >
            </Alert>
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
          <div class="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel for="kegiatan-foto"
                ><ImagePlus class="size-4 text-primary" />Foto
                kegiatan</FieldLabel
              >
              <div
                class="grid gap-3 rounded-lg border border-dashed bg-muted/30 p-4"
              >
                <input
                  id="kegiatan-foto"
                  ref="inputFoto"
                  class="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="pilihFoto"
                />
                <FieldDescription
                  >JPEG, PNG, atau WebP. Maksimal 3 MB. Foto yang lebih besar
                  dikecilkan otomatis.</FieldDescription
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
                <div
                  v-if="pratinjauFoto && foto"
                  class="flex items-center gap-3"
                >
                  <img
                    :src="pratinjauFoto"
                    class="size-16 rounded-md border object-cover"
                    alt="Pratinjau foto kegiatan"
                  />
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium">{{ foto.name }}</p>
                    <p class="text-muted-foreground">
                      {{ ukuranFile(foto.size) }}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Hapus foto yang dipilih"
                    @click="hapusFotoPilihan"
                    ><X class="size-4"
                  /></Button>
                </div>
                <a
                  v-else-if="lampiranTersimpan.foto_url"
                  class="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4"
                  :href="lampiranTersimpan.foto_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  ><ExternalLink class="size-3.5" />Lihat foto tersimpan</a
                >
              </div>
            </Field>
            <Field>
              <FieldLabel for="kegiatan-pdf"
                ><FileText class="size-4 text-primary" />Laporan PDF</FieldLabel
              >
              <div
                class="grid gap-3 rounded-lg border border-dashed bg-muted/30 p-4"
              >
                <input
                  id="kegiatan-pdf"
                  ref="inputPdf"
                  class="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
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
                <div v-if="pdf" class="flex items-center gap-3">
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
                  class="h-72 w-full rounded-md border bg-background"
                  title="Pratinjau laporan PDF"
                />
                <template v-else-if="lampiranTersimpan.pdf_url">
                  <iframe
                    :src="lampiranTersimpan.pdf_url"
                    class="h-72 w-full rounded-md border bg-background"
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
      <Button type="submit" :disabled="memuat || sibuk">
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
