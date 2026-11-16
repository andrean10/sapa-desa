# Progress SAPA DESA

## Status terkini — 17 November 2026

Commit terakhir: `57abc67 feat: implement UPT dashboard and report management functions in upt.model.ts`.

### Yang sudah tersedia di repo

| Area | Keadaan saat ini |
|---|---|
| Masyarakat | Alur `/`, `/informasi`, `/lapor`, `/lacak`, dan `/privasi` sudah tersedia. Form laporan memakai GPS, wilayah bertingkat, unggah foto terkompresi, dialog kode pelacakan, dan lacak publik dengan data yang dibatasi untuk privasi. |
| UPT | Halaman `/upt`, `/upt/laporan`, `/upt/laporan/[id]`, `/upt/kegiatan`, `/upt/kegiatan/baru`, `/upt/kegiatan/[id]`, `/upt/pegawai`, `/upt/profil`, dan `/upt/pilih-petugas` sudah tersedia. Endpoint, controller, model, dan composable untuk dashboard, laporan/status, kegiatan PIMPASA, pegawai, profil, unggah file, serta penghapusan sesuai jendela waktu sudah ditambahkan. |
| Kanwil | Halaman dashboard, laporan baca, detail UPT, pantauan, peringkat, desa binaan, penugasan, wilayah kerja, FAQ, kegiatan baca, dan pengaturan sudah tersedia beserta endpoint/controller/model terkait. Admin memakai sebagian jalur Kanwil sesuai hak database. |
| Admin | `/admin/status`, `/admin/akun`, impersonasi melalui `/auth/confirm`, reset password, aktivasi akun, pembuatan akun, dan banner status validasi lokasi sudah tersedia. |
| Keamanan dan struktur | Pemisahan client Supabase, route-controller-model, middleware peran, rate limit publik, konfigurasi global, serta tipe turunan sudah tersedia tanpa perubahan skema database. |

### Yang belum diverifikasi atau masih terbuka

- Uji alur browser end-to-end untuk login, pemilihan petugas UPT, impersonasi, perubahan status, unggah kegiatan, dan seluruh alur Kanwil/Admin belum dilakukan.
- Pemeriksaan acceptance dan finishing visual untuk semua halaman belum dilakukan.
- `docs/PROGRESS.md` belum menjadi bukti bahwa seluruh kriteria PRD sudah lulus; implementasi halaman/endpoint perlu tetap diuji terhadap staging Supabase.
- Teks final `/privasi` masih menunggu materi resmi Kanwil.
- Log aktivitas belum dibuat karena trigger log memang belum diaktifkan untuk production. Setelah trigger aktif, baru buat menu dan halaman `/admin/log`.

### Fitur yang sengaja ditunda sesuai spesifikasi

Persetujuan Kanwil atas penugasan PIMPASA, pemindahan laporan antar-UPT, UI hari libur, akun Rudenim, akhir pekan khusus UPT, peta titik laporan, dan pemaksaan ganti password pada login pertama belum dibuat sesuai keputusan di `AGENTS.md` dan `PRD.md`.

## Tahap 5 — Admin dan penutup (berjalan)

### Pekerjaan tahap 5

| Bagian | Hasil saat ini |
|---|---|
| Status sistem | `/admin/status` membaca `dashboard_admin_status`, menampilkan status validasi lokasi dan hitungan akun. Saklar shadcn-vue mengirim perubahan melalui sesi admin/RLS dan meminta konfirmasi saat mematikan validasi. Layout admin menampilkan banner merah ketika validasi mati. |
| Kelola akun | `/admin/akun` menampilkan akun dan nama kantor (termasuk kantor nonaktif), membuat akun melalui Admin API, reset password, aktivasi/nonaktif, serta impersonasi magic link. Form hanya menawarkan kantor aktif dan server menolak akun UPT kedua di kantor yang sama. Reset password dan aktivasi/nonaktif memakai dialog konfirmasi. Password tidak dikembalikan atau disimpan aplikasi. Operasi Admin API dibatasi setelah sesi diverifikasi sebagai admin. |
| Impersonasi | Magic link diarahkan ke `/auth/confirm`; callback memverifikasi token hash, memuat profil, dan menampilkan banner “Anda masuk sebagai {akun}” dengan tombol Keluar. Logout membersihkan cookie banner. Tab impersonasi dibuka langsung dari klik agar tidak diblokir browser. |
| Navigasi admin | Status sistem dan akun berada pada kelompok “Admin” terpisah; menu log tetap tersembunyi sampai diaktifkan di production. |
| Log | Belum dibuat/diaktifkan. PRD dan SCHEMA menyatakan trigger log nonaktif sampai production dan halaman/menu dibuat setelah log diaktifkan; karena itu menu log tetap disembunyikan. |

### Pemeriksaan tahap 5 yang sudah dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `npm run typecheck` | Lulus setelah perubahan status, akun, callback, dan layout. |
| `npm run lint` | Lulus, 35 warning `vue/require-default-prop` pada komponen UI; tidak ada error. Lint terarah berkas tahap 5 juga lulus tanpa error. |
| `npm run build` | Lulus; build Nuxt/Nitro selesai. |
| Uji alur browser akun/impersonasi | Belum dilakukan. |
| Pemeriksaan kriteria penerimaan semua halaman | Belum dilakukan; menunggu sesi finishing desain dan pengujian alur seluruh halaman. |
| Perubahan skema database | Tidak ada. |

### Masih tersisa tahap 5

- Sesi finishing untuk desain dan uji alur seluruh halaman sesuai rencana pemilik project.
- Aktivasi trigger log saat production; setelah itu baru buat menu dan halaman `/admin/log` sesuai PRD.

## Tahap 2 — Masyarakat (mulai)

### Kondisi awal Tahap 2

- Repo bersih kecuali riwayat commit, pada `master` (`17561f3 chore: update favicon.ico`, `1329e33 catat verifikasi Tahap 1`, `42bf04b siapkan kerangka Tahap 1`).
- `docs/PRD.md` bagian 4.1–4.7 dan 11–12 serta `docs/database/KONTRAK_API.md` bagian 1–3 dan 9 dibaca. Tidak ada skema yang perlu diubah.
- Yang sudah ada: landing, form lapor dengan GPS dasar, lacak via endpoint server, useFaq/useWilayah, controller/model publik, rate limit per IP, unggah foto server-side, tracking result privacy shape.
- Kekurangan terhadap PRD: `/informasi` dan `/privasi` belum ada; layout publik belum dipakai; FAQ landing tidak disembunyikan saat kosong dan belum ada pencarian/accordion terkontrol; form masih meminta GPS otomatis tanpa pemeriksaan HTTPS/izin, tidak memisahkan error GPS, belum kompres/pratinjau foto, belum menampilkan kantor/penghitung karakter/validasi pesan, dan sukses hanya teks tanpa dialog/timeline/copy; lacak belum membaca query, memformat input, menunjukkan warna/penjelasan/tombol muat ulang, dan masih menghapus hasil saat mencari ulang.
- Scope pekerjaan: menyelesaikan rute masyarakat `/`, `/informasi`, `/lapor`, `/lacak`, `/privasi`, komponen FAQ/timeline, serta UX dan error mapping. Halaman login/dashboard bukan bagian Tahap 2.

### Pekerjaan dan bukti Tahap 2

| Bagian | Hasil |
|---|---|
| Layout publik dan landing | Semua halaman masyarakat memakai layout bersama. Landing memuat hero, alur tiga langkah, FAQ pintas (disembunyikan saat FAQ kosong), CTA dan privasi, serta metadata sosial. |
| Informasi | Dibuat `/informasi` dengan akordeon satu-buka, butir pertama terbuka, teks FAQ di-escape dan mempertahankan baris baru, pencarian saat FAQ > 8, keadaan loading/kosong/error, dan CTA responsif. |
| Privasi | Dibuat `/privasi` dengan kerangka PRD “Ketentuan Penggunaan Data” dan teks “Akan diisi oleh Kanwil”; tidak menambah klaim kebijakan yang belum disediakan. |
| Form masyarakat | GPS meminta izin hanya setelah tombol kecuali izin sudah diberikan, mengecek HTTPS/dukungan browser, memisahkan penolakan/GPS mati/timeout, menonaktifkan seluruh form sampai lokasi diperoleh dan selama kirim, validasi batas input, penghitung karakter, wilayah bertingkat, nama kantor, follow-up opsional, dan bantuan privasi. |
| Foto | Validasi MIME, kompresi sisi panjang 1600 px dan kualitas bertahap sampai batas 3 MB, pratinjau, hapus, dan lepaskan object URL. Server tetap memvalidasi file. |
| Hasil kirim | Dialog kode pelacakan, tombol salin dengan umpan balik, timeline status Diterima, tautan cek status, konfirmasi menutup sebelum kode disalin, lalu reset form. Error lokasi di luar Riau, rate limit, kode sebelumnya, file, dan desa dipetakan ke pesan masyarakat. |
| Lacak | Mask input uppercase/hyphen, dukungan `?kode=`, status badge dan penjelasan, kantor/waktu kirim dalam WIB, timeline publik, muat ulang. Pesan 404 dan 429 umum; hasil tidak memuat PII/petugas. |
| Server | Nama kantor publik dibaca lewat endpoint/model; kode FK desa tidak valid dipetakan sebagai 422. Client anonim tetap dipakai untuk baca publik, service role tetap pada server untuk jalur laporan. Tidak ada perubahan skema. |
| Berbagi dan aksesibilitas | Teks pengguna tetap teks biasa, target kontrol minimal 44 px di bagian utama, label terhubung, pesan loading/error memiliki status ARIA. |

### Pemeriksaan Tahap 2

| Pemeriksaan | Hasil |
|---|---|
| `npm run typecheck` | Lulus, exit code 0. |
| `npm run lint` | Lulus, exit code 0. |
| `npm run test` | Lulus: 3 test files, 7 tests. Termasuk normalisasi kode pelacakan (uppercase, hapus spasi, pemisah, karakter yang dilarang) dan utilitas Tahap 1. |
| `npm run build` | Lulus; Nuxt 4.6.4 / Nitro production build. |
| Smoke test production server | `GET /`, `/informasi`, `/lapor`, `/lacak`, `/privasi` semuanya 200. Server lokal tidak memiliki URL/kunci Supabase staging, jadi fetch FAQ/wilayah menampilkan state error; pengujian data live memerlukan `.env` staging. Tidak ada kredensial yang dibuat atau dicatat. |
| `git diff --check` | Lulus, hanya peringatan normal Git untuk konversi LF/CRLF pada Windows. |
| `rg` untuk `v-html` dan `supabase` pada halaman/komponen publik | Tidak ada hasil; akses database publik tetap melewati composable dan endpoint server. |
| Uji baca staging | FAQ merespons 200 (0 baris saat diuji), kabupaten/kota 12 baris; cascade Pekanbaru → Binawidya → Binawidya berhasil. Endpoint nama kantor awalnya menolak UUID; validasi diperbaiki dan nama Kantor Imigrasi Kelas I TPI Pekanbaru berhasil dibaca. |
| Uji kirim + lacak staging | Satu laporan sintetis berlabel `DATA UJI STAGING SAPA DESA` dibuat di Pekanbaru; submit berhasil dan baris timeline awal `diterima` ditemukan. Record ini adalah data uji permanen di project staging. Kode pelacakan diberikan kepada pemilik project lewat sesi kerja, tidak disimpan di dokumen. |
| Privasi endpoint lacak | `GET` lacak untuk kode yang tidak ada merespons 404. Lacak record uji merespons 200 dan hanya memiliki `kode_pelacakan`, `status`, `kantor`, `dikirim_pada`, `timeline`; tidak ada nama/alamat/isi laporan/pegawai. |
| Database | Tidak ada perintah tulis atau perubahan skema. |

### Sisa Tahap 2

- Teks final kebijakan privasi masih menunggu materi resmi Kanwil sebagaimana PRD.
- Kredensial staging sudah menggunakan Publishable key (`sb_publishable_…`) dan Secret key (`sb_secret_…`); anon dan server secret berhasil diuji. Key hanya tersimpan di `.env` lokal dan tidak pernah ditampilkan di log.
- Commit lokal dicatat setelah pemeriksaan; tidak ada push.

## Kondisi awal

Pemeriksaan awal dilakukan setelah instruksi terbaru menyediakan `docs/PRD.md` (52.242 byte). Dokumen ini sebelumnya tidak ada pada pemeriksaan lama; versi yang ada sekarang dibaca sebagai sumber terkini.

- `git status --short --branch`: `master...origin/master`; perubahan lokal awal: `AGENTS.md` (modified), `app/app.vue` (modified), `public/favicon.ico` (modified), `docs/PRD.md` (untracked). Semua perubahan awal dipertahankan dan diperiksa sebelum disentuh.
- `git log --oneline -15`: hanya tiga commit terlihat: `d3caa13 feat: add report tracking and submission pages`, `553a026 feat: initialize server structure and add Supabase client utilities`, `faed510 add: initialize projects`.
- Struktur yang sudah ada: Nuxt 4/TypeScript, halaman dan composable tahap masyarakat, middleware, server api/controller/model, tiga pola client Supabase terpisah, konfigurasi awal, dan tipe database.
- Yang belum ada saat mulai: `docs/PROGRESS.md`, layout dan komponen kerangka yang diminta, pemisahan empat config file, utilitas waktu/angka beserta test, lint/test scripts dan dependensi UI shadcn-vue.
- Yang tampak perlu diselaraskan: middleware masih memakai `/dashboard` dan `/login` alih-alih rute per peran dan `/masuk`; konfigurasi warna ada di `app.ts`, sebagian token/warna hanya sebagian; daftar status belum mengikuti seluruh palet dan label PRD; CSS masih berisi direktif Tailwind dan aturan body; config belum menginjeksikan semua token tema.
- `.env` tidak ada saat pemeriksaan; `.env` tercakup aturan `.gitignore`. `.env.example` tersedia dan memakai nama variabel environment publik untuk URL/anon serta server-only untuk service role.

## Ringkasan pemahaman

1. Masyarakat menggunakan halaman publik tanpa akun; UPT menangani laporan kantornya, kegiatan PIMPASA, pegawai, dan profil kantor.
2. Kanwil memantau semua UPT serta mengelola DBI, penugasan, wilayah, FAQ, jenis kegiatan, pengaturan, dan peringkat; Kanwil tidak mengubah status laporan.
3. Admin memiliki wewenang Kanwil ditambah saklar lokasi, mutasi pegawai, pengelolaan akun/log, dan status sistem.
4. Browser memakai anon key hanya untuk Auth dan data publik; server sesi user memakai token pengguna dan tetap tunduk pada RLS; service role server-only untuk jalur anonim terbatas dan Admin API.
5. MVC Nuxt: `app/` adalah view dan pemanggil composable, `server/api` route tipis, controller validasi/alur, dan model satu-satunya lapisan query Supabase.
6. Skema database tidak diubah; bila kontrak tidak mencukupi, kebutuhan dicatat untuk pemilik project dan perubahan dilakukan melalui migrasi eksternal.
7. Semua waktu database UTC ditampilkan sebagai WIB; tanggal/hari ini juga dihitung menurut WIB.
8. Data sensitif pelapor tidak tampil pada daftar atau endpoint lacak; service role tidak pernah masuk ke browser/config publik.

## Butuh keputusan

- Referensi menyebut `KONTRAK_API.md` bagian “3a”, tetapi dokumen saat ini memiliki bagian 3 (Lacak laporan) tanpa subbagian bernama 3a. Untuk tahap kerangka, kontrak bagian 3, 8, dan 9 dipakai; tidak ada kebutuhan skema yang diajukan.
- PRD menempatkan warna status bersama metadata status di `tema.ts`, sementara AGENTS.md menempatkan label/urutan/penjelasan status di `teks.ts`. Implementasi akan menyimpan warna di `tema.ts` dan label/urutan/penjelasan di `teks.ts`, dengan kunci enum yang sama dan tanpa mengulang kode warna.
- Repo sudah memuat halaman masyarakat dengan implementasi lebih jauh dari cakupan kerangka Tahap 1. Halaman yang ada akan dipertahankan dan tidak dikembangkan dalam pekerjaan ini; pekerjaan baru dibatasi pada kerangka bersama dan kelengkapan Tahap 1.

## Pekerjaan dan alasan

| Bagian | Perubahan | Alasan |
|---|---|---|
| Konfigurasi global | Memisahkan `app.ts`, `tema.ts`, `teks.ts`, `batas-file.ts`; menambahkan menu per peran dan semua warna PRD | Satu sumber kebenaran, status cocok enum, dan nilai warna dapat diubah tanpa menyunting CSS/komponen |
| Tema SSR | Menyuntikkan variabel tema di atribut `<html>` melalui `useHead`; CSS/Tailwind memakai token; radius dan palet grafik/status mengikuti PRD | Warna tersedia saat HTML awal, tanpa menunggu hidrasi |
| UI | Memasang `shadcn-nuxt`, menyediakan `components.json`, utilitas kelas dan Button di `app/components/ui`; kerangka HyperUI di `app/components/public` | Menyiapkan pustaka UI untuk dashboard dan komponen publik tanpa membangun halaman tahap berikutnya |
| Layout dan rute | Membuat layout publik dan dashboard (header/footer, sidebar, bilah atas, area banner), placeholder `/masuk`, `/403`, `/404`, `/upt`, `/kanwil`, `/admin`, dan pilih petugas | Menyiapkan kerangka navigasi dan tujuan redirect middleware |
| Middleware | Melindungi `/upt/*`, `/kanwil/*`, `/admin/*`, `/akun/*`, memeriksa peran, mengarahkan tanpa sesi ke `/masuk?redirect=...`, serta meminta pemilihan petugas UPT | Sesuai PRD 3.5; tidak memakai mode uji untuk melonggarkan akses |
| Helper API | Mengganti pemanggilan `.create()` yang tidak tersedia pada `useRequestFetch`; cookie SSR dan `x-bertugas-id` tetap diteruskan | Pemeriksaan runtime awal menemukan rute dashboard berstatus 500 karena helper lama melempar TypeError |
| Tipe turunan | Menambahkan `LaporanPimpasaBaru` dan `PenugasanBaru` bersama `LaporanBaru` | Mengikuti bentuk yang disarankan KONTRAK_API bagian 8 tanpa tipe tandingan |
| Utilitas | Menambahkan format waktu/tanggal WIB, hari ini WIB, angka Indonesia, dan unit test | Memusatkan pemformatan yang dipakai UI dan menguji format yang ditetapkan |
| Lint dan test | Memasang Nuxt ESLint dan Vitest; menambahkan script `lint` dan `test`; merapikan import/variabel yang dilaporkan lint | Menyediakan pemeriksaan Tahap 1 yang dapat diulang |
| Existing work | Mempertahankan halaman masyarakat yang telah ada; hanya mengganti formatter waktu lacak ke utilitas bersama | Halaman tersebut sudah ada sebelum Tahap 1 dilanjutkan; tidak menambah fitur Tahap 2+ |
| Dokumen tipe | Menghapus nama produk hanya dari komentar header `database.types.ts`; deklarasi tipe tetap sama | Memenuhi pencarian agar nama produk hanya didefinisikan di `app.ts`; tidak mengubah tipe hasil database |

Dependency baru dan alasan:

- `shadcn-nuxt@2.9.0`: integrasi Nuxt untuk shadcn-vue, auto-import komponen dalam `app/components/ui`.
- `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.7.0`: menggabungkan kelas dan varian tombol shadcn.
- `@nuxt/eslint@1.17.0` dan `eslint@10.15.0`: konfigurasi lint flat yang memahami Nuxt.
- `vitest@5.1.0`: runner unit test utilitas.

npm melaporkan 17 advisori pada dependency tree (6 low, 11 moderate) setelah instalasi. Tidak menjalankan perbaikan otomatis agar versi lain tidak berubah di luar ruang lingkup.

## Hasil bukti penerimaan

| Pemeriksaan | Hasil |
|---|---|
| `npm run typecheck` | Lulus, exit code 0. `vue-tsc --noEmit` untuk `.nuxt/tsconfig.app.json`, `.nuxt/tsconfig.server.json`, dan `.nuxt/tsconfig.shared.json` juga lulus. |
| `npm run lint` | Lulus, exit code 0. |
| `npm run test` | Lulus: 2 test files, 4 tests. Termasuk `16 Nov 2026, 14.30 WIB`, `16 Nov 2026`, hari WIB melewati tengah malam UTC, dan angka `1.862`. |
| `npm run build` | Lulus; Nuxt 4.6.4 dan Nitro build selesai. |
| Dev server | Server milik sesi IDE sudah berjalan di `http://[::1]:3000` (PID 10452); tidak diambil alih. Hasil tanpa mengikuti redirect: `/` 200, `/masuk` 200, `/upt` 302 `Location: /masuk?redirect=/upt`, `/kanwil` 302 `Location: /masuk?redirect=/kanwil`, `/admin` 302 `Location: /masuk?redirect=/admin`. HTML SSR mengandung token `--primary:#17365d`. |
| `rg -n '(#[0-9a-fA-F]{3,8}\b|\boklch\(|\bhsl\()' app` | `NO_LITERAL_COLORS_IN_APP`. |
| `rg -n 'SUPABASE_SERVICE_ROLE_KEY|NUXT_PUBLIC_' app shared` | `NO_SERVICE_OR_PUBLIC_ENV_KEYS_IN_APP_SHARED`. Kunci service role hanya dibaca di `server/utils/supabase.ts`, di luar `runtimeConfig.public`. |
| `rg -n '(@supabase|createClient|\.from\(|\.rpc\(|\.storage\.)' app/pages app/components` | `NO_DIRECT_SUPABASE_CALLS_IN_PAGES_COMPONENTS`. |
| `rg -n 'SAPA DESA' app server shared` | Hanya `shared/config/app.ts:4`, sebagai `APP_NAME`. |
| `rg -n 'Intl\.DateTimeFormat|Intl\.NumberFormat|toLocale' app server shared -g '!shared/types/database.types.ts'` | Semua pemformatan berada di `shared/utils/waktu.ts` dan `shared/utils/angka.ts`. |
| `.env` | `Test-Path .env` menghasilkan `False`; `git check-ignore .env` menghasilkan `.env`; `git ls-files -- .env` kosong. `.env.example` hanya berisi URL/key kosong dan `NUXT_PUBLIC_APP_MODE=test`. |
| `git diff --check` | Lulus, tidak ada whitespace error. |

## Butuh keputusan

- Referensi menyebut `KONTRAK_API.md` bagian “3a”, tetapi dokumen saat ini memiliki bagian 3 (Lacak laporan) tanpa subbagian bernama 3a. Untuk tahap kerangka, kontrak bagian 3, 8, dan 9 dipakai; tidak ada kebutuhan skema yang diajukan.
- PRD menempatkan warna status bersama metadata status di `tema.ts`, sementara AGENTS.md menempatkan label/urutan/penjelasan status di `teks.ts`. Implementasi menyimpan warna di `tema.ts` dan label/urutan/penjelasan di `teks.ts`, dengan kunci enum yang sama dan tanpa mengulang kode warna.
- Repo sudah memuat halaman masyarakat dengan implementasi lebih jauh dari cakupan kerangka Tahap 1. Halaman yang ada dipertahankan; pekerjaan baru dibatasi pada kerangka bersama dan kelengkapan Tahap 1.

## Belum dikerjakan

- Tidak ada butir Tahap 1 yang tertinggal dari spesifikasi yang tersedia.
- Tidak ada perintah yang menulis ke database; tidak ada skema yang diubah.
- Commit lokal Tahap 1: `42bf04b siapkan kerangka Tahap 1`. Tidak ada perubahan yang di-push.
- `public/favicon.ico` masih berubah di working tree dan sengaja tidak dimasukkan ke commit karena tidak terkait Tahap 1.
