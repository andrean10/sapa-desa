# AGENTS.md — SAPA DESA

Dokumen ini dibaca pertama kali di setiap sesi. Baca juga dokumen di bagian 9 sebelum menulis kode yang menyentuh database.

## 1. Tentang project

**SAPA DESA** adalah website pelayanan Kantor Wilayah Kemenimipas Riau dan 7 UPT (Kantor Imigrasi) di Riau.

- Masyarakat (tanpa akun) scan QR, membaca informasi keimigrasian (FAQ), lalu mengirim **laporan pengaduan** (WNA/WNI). Laporan otomatis ditujukan ke UPT yang membawahi wilayahnya, bukan ke Kanwil.
- **UPT** menangani laporan (ubah status, tulis keterangan) dan membuat **laporan kegiatan PIMPASA** di Desa Binaan Imigrasi (DBI).
- **Kanwil** memonitor UPT (dashboard, peringkat, pantauan laporan terlambat), mengelola desa binaan dan penugasan PIMPASA, serta mengubah wilayah kerja UPT.
- **Admin** (pemilik project) bisa semuanya dan memegang pengaturan sistem.

## 2. Stack

| Bagian | Pilihan |
|---|---|
| Framework | Nuxt 4 (folder `app/`, `server/`, `shared/`), TypeScript |
| Database/Auth/Storage | Supabase **self-hosted di VPS** (fitur lebih terbatas dari cloud). Saat pengembangan memakai project cloud sebagai staging |
| UI dashboard (admin, Kanwil, UPT) | shadcn/ui (shadcn-vue) |
| UI masyarakat + landing page | HyperUI (snippet Tailwind) |
| Client database | supabase-js. Boleh memakai modul `@nuxtjs/supabase` selama tiga jenis client di bagian 6 terpenuhi |

Dependency dipasang oleh Codex. Pilih versi stabil yang kompatibel dengan Nuxt di `package.json`, dan sebutkan apa yang dipasang beserta alasannya.

## 3. Peran dan halaman

| Peran | Login | UI | Ringkasan wewenang |
|---|---|---|---|
| masyarakat | tidak ada (anonim) | HyperUI | kirim laporan, lacak laporan dengan kode, baca FAQ |
| `upt` | username + password | shadcn | laporan kantornya sendiri, ubah status, laporan kegiatan PIMPASA, kelola pegawai kantornya, profil kantor |
| `kanwil` | username + password | shadcn | baca semua, dashboard dan peringkat, kelola desa binaan/penugasan/wilayah kerja/FAQ/jenis kegiatan/hari libur/pengaturan (kecuali saklar lokasi). **Tidak bisa** mengubah status laporan |
| `admin` | username + password | shadcn | semua hak Kanwil + **ubah status laporan** (database mengizinkan; `p_pegawai_id` boleh kosong untuk admin), saklar lokasi, mutasi pegawai, hapus laporan kegiatan, lihat log, status sistem |

Alur login:
1. Form login meminta **username** saja. Email dibentuk `${username}@${AUTH_EMAIL_DOMAIN}` (nilai dari konfigurasi global, jangan ditulis di banyak tempat). Tidak ada email asli yang terkirim dan tidak ada "lupa password" mandiri.
2. Untuk peran `upt`, setelah login **wajib** memilih "bertugas atas nama" dari daftar `pegawai` aktif kantornya. Pilihan disimpan di sesi, dipakai sebagai `p_pegawai_id` saat ubah status, dan dikirim sebagai header `x-bertugas-id` pada request ke Supabase (dipakai pencatat log kelak).
3. Pendaftaran akun publik **dimatikan** (`DISABLE_SIGNUP=true` di Supabase). Akun dibuat admin lewat Admin API dari server.

## 4. Struktur folder dan pola MVC

Pola MVC dipetakan ke Nuxt seperti ini. Satu lapisan, satu tanggung jawab.

```
app/                         ← VIEW (sisi browser)
  pages/                     halaman (hanya tampilan + memanggil composable)
  components/                komponen UI (shadcn di components/ui, HyperUI di components/public)
  layouts/                   layout per peran (publik, dashboard)
  composables/               akses ke endpoint server (satu file per domain: useLaporan, useDashboard, dst.)
  middleware/                guard rute berdasarkan peran
server/
  api/                       ← ROUTE: tipis, hanya baca request lalu panggil controller
  controllers/               ← CONTROLLER: validasi input, aturan alur, memilih model
  models/                    ← MODEL: satu-satunya tempat query/rpc Supabase
  utils/supabase.ts          pembuat client Supabase (lihat bagian 6)
shared/
  config/                    ← KONFIGURASI GLOBAL (bagian 5): app.ts, tema.ts, teks.ts, batas-file.ts
  types/database.types.ts    tipe hasil generate (jangan diedit manual)
  types/                     tipe turunan (LaporanBaru, dst.)
docs/
  PRD.md                     spesifikasi tampilan dan perilaku tiap halaman
  database/                  SCHEMA.md dan KONTRAK_API.md
```

Aturan:
- Halaman dan komponen **tidak boleh** memanggil Supabase langsung untuk data yang dilindungi. Mereka memanggil composable, composable memanggil `server/api`.
- Query Supabase hanya ada di `server/models`. Kalau ada bug data, cukup periksa satu lapisan.
- Controller memvalidasi input (disarankan zod) sebelum menyentuh model. Kesalahan dikembalikan dengan status HTTP yang tepat dan pesan Bahasa Indonesia.

## 5. Konfigurasi global (satu sumber kebenaran)

Semua nilai yang dipakai di lebih dari satu file ditaruh di folder `shared/config/`, **bukan** ditulis ulang. Satu folder, empat file:

| File | Isi |
|---|---|
| `app.ts` | `APP_NAME = 'SAPA DESA'`, tagline, nama instansi, `AUTH_EMAIL_DOMAIN = 'sapadesa.com'`, `TIMEZONE = 'Asia/Jakarta'`, pola kode pelacakan `SD-XXXX-XXXX` (regex `^SD-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$`), `AMBANG_DESA_LAMA_HARI` |
| `tema.ts` | **Satu-satunya tempat kode warna** (palet, pemetaan variabel shadcn, warna status laporan). Nilainya ada di `docs/PRD.md` bagian 2. Komponen dan CSS tidak boleh menulis ulang hex |
| `teks.ts` | Label status laporan beserta penjelasan ramah dan urutan timeline (kunci harus sama dengan enum `status_laporan`), label `jenis_terlapor` (WNA/WNI), `peran_pengguna`, `jenis_wilayah_desa`, `alasan_berakhir_penugasan`, pesan galat umum |
| `batas-file.ts` | Foto 3 MB (`image/jpeg`, `image/png`, `image/webp`), PDF 8 MB (`application/pdf`). Angka ini sama dengan batas bucket di database |

Konfigurasi rahasia hanya lewat environment, dan `.env` sudah ada di `.gitignore`.

## 6. Aturan keamanan (wajib, jangan dilanggar)

Tiga jenis client Supabase, dibuat di `server/utils/supabase.ts`:

| Client | Kunci | Dipakai untuk |
|---|---|---|
| Browser | anon key (publik) | hanya login/logout dan membaca data publik bila perlu |
| Server dengan sesi user | token user yang login | **semua** aksi akun UPT/Kanwil/admin (RLS tetap berlaku) |
| Server service role | service role key | hanya untuk jalur masyarakat anonim dan Admin API (bagian di bawah) |

Aturan:
1. **Service role key hanya ada di `server/`.** Jangan masuk ke `runtimeConfig.public`, variabel `NUXT_PUBLIC_*`, kode browser, log, atau repo.
2. **Laporan masyarakat dikirim lewat endpoint server**, lalu server meng-insert dengan service role. Browser tidak pernah insert langsung ke tabel `laporan`. Pasang **rate limit per IP** pada endpoint kirim dan lacak, karena Supabase self-hosted tidak punya rate limit bawaan.
3. **Jangan kirim kolom yang diisi database**: `kantor_id`, `kode_pelacakan`, `status`, dan `dibuat_oleh` (lihat daftar di SCHEMA.md). Nilai kiriman klien diabaikan atau ditolak oleh trigger, dan jangan jadi sumber kebenaran.
4. **`ubah_status_laporan` dan insert `laporan_pimpasa` butuh sesi login user.** Service role tidak punya identitas (`auth.uid()` kosong) sehingga ditolak. Panggil dengan client sesi user.
5. **Form masyarakat wajib GPS**: semua input dan tombol kirim dinonaktifkan sampai izin lokasi aktif dan koordinat didapat. Pesan "izin ditolak" dan "GPS mati" ditangani di frontend. Validasi "di dalam Provinsi Riau" tetap dijaga database (trigger), jangan hanya mengandalkan frontend. Jangan tampilkan peringatan akurasi GPS ke masyarakat.
6. **Privasi**: daftar laporan di dashboard tidak menampilkan `nama_pelapor` dan `alamat_pelapor` (hanya di halaman detail). Endpoint lacak publik hanya mengembalikan status, kantor, waktu kirim, dan timeline. `riwayat_status.pegawai_id`/`dibuat_oleh` dan nama petugas **tidak boleh** sampai ke masyarakat. Keterangan di timeline bersifat publik, beri label di form petugas: "Keterangan ini dapat dilihat oleh pelapor".
7. **Peringkat antar-UPT tidak ditampilkan ke akun UPT.** Fungsi peringkat hanya untuk Kanwil dan admin.
8. **Foto laporan masyarakat** (`foto-laporan`) tidak punya policy baca. Untuk melihatnya, server memverifikasi akses lewat query dengan sesi user (RLS pada `laporan`), baru membuat **signed URL** dengan service role.
9. **Tidak ada mode "bypass policy".** Pengujian memakai project staging, impersonasi akun lewat Admin API, dan saklar `validasi_lokasi_aktif` (khusus admin). Env `NUXT_PUBLIC_APP_MODE` (`test`/`live`) hanya boleh memunculkan banner, tidak mengubah hak akses. Saat saklar lokasi mati, dashboard admin menampilkan banner merah (`dashboard_admin_status`).
10. Waktu dari database berformat UTC. Format ke `Asia/Jakarta` saat ditampilkan (termasuk sisi kiri garis timeline).

## 7. Aturan perubahan database

- **Codex tidak mengubah skema database** (tabel, kolom, fungsi, policy, trigger, bucket). Semua perubahan dikerjakan lewat migrasi di luar repo ini, lalu `shared/types/database.types.ts` di-generate ulang.
- Kalau fitur butuh kolom, fungsi, atau policy baru: berhenti, tulis permintaannya dengan jelas (tabel, kolom, alasan, siapa yang butuh), dan minta pemilik project menambahkannya.
- Jangan membuat tabel bayangan di sisi aplikasi untuk menutup kekurangan skema.
- Generate ulang tipe: `supabase gen types typescript --project-id <id> --schema public > shared/types/database.types.ts` (cloud) atau `--db-url <url>` (VPS).
- Fitur yang **sengaja belum ada**, jangan dibuat sendiri: persetujuan Kanwil atas penugasan PIMPASA, pemindahan laporan antar-UPT, UI hari libur, akun Rudenim, akhir pekan untuk UPT tertentu, peta titik laporan, log aktivitas (trigger sudah ada tapi nonaktif sampai production).

## 8. Gaya kode

- Kode rapi dan mudah di-debug: fungsi kecil, nama jelas dalam Bahasa Indonesia untuk istilah domain (`laporan`, `kantor`, `desa`) sesuai nama di database, komentar singkat hanya untuk alasan non-obvious.
- TypeScript ketat. Pakai tipe dari `database.types.ts` (`Tables<'laporan'>`, `Enums<'status_laporan'>`, dst.), jangan membuat tipe tandingan.
- Tangani error dengan tipe yang jelas. Pesan error dari database sudah berbahasa Indonesia dan aman ditampilkan (lihat KONTRAK_API.md).
- Jangan menulis string yang sama di banyak file (nama project, label status, batas file, dll). Ambil dari `shared/config/`.
- Selalu tampilkan status loading, kosong, dan error di UI.

## 9. Dokumen acuan

| File | Isi |
|---|---|
| `docs/PRD.md` | Halaman, rute, komponen, teks, dan perilaku di setiap halaman. Jawaban untuk "apa yang dilihat dan dilakukan pengguna" |
| `docs/database/SCHEMA.md` | Semua tabel, kolom, relasi, constraint, trigger, dan hak akses per peran |
| `docs/database/KONTRAK_API.md` | Setiap rpc/insert/storage yang dipakai UI: parameter, hasil, siapa yang boleh, dan di sisi mana dipanggil. Termasuk usulan route server |
| `shared/types/database.types.ts` | Tipe TypeScript hasil generate dari database |

Jika dokumen dan database berbeda, **database yang benar**. Laporkan selisihnya ke pemilik project. Urutan baca untuk fitur baru: `PRD.md` (apa yang dibangun), lalu `KONTRAK_API.md` (panggilan databasenya), lalu `SCHEMA.md` bila butuh detail tabel.

## 10. Cara kerja

- Kerjakan bertahap (satu fitur per langkah), jelaskan penalaran untuk keputusan yang kompleks, dan tanyakan bila ada pilihan yang memengaruhi desain.
- Perhatikan detail kecil: nama kolom yang mirip (misalnya `laporan.desa_kelurahan_id` vs `laporan_pimpasa.desa_id`), zona waktu, dan kolom yang diisi trigger.
- Jangan menyimpan password, service role key, atau data akun di repo, log, atau dokumen.
