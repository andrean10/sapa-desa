# Progress Tahap 1 — Kerangka SAPA DESA

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
