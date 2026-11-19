# KONTRAK API — Database SAPA DESA

Daftar semua panggilan ke database yang dipakai UI. Tipe parameter dan hasil yang pasti ada di `shared/types/database.types.ts`; dokumen ini menjelaskan **siapa yang boleh, di sisi mana dipanggil, dan perilaku yang tidak terlihat dari tipe**.

Singkatan client (lihat AGENTS.md bagian 6):
- **`sesi-user`** = client server dengan token user yang login (RLS berlaku).
- **`service`** = client server dengan service role (melewati RLS, tanpa identitas user).
- **`anon`** = client dengan anon key.

Aturan umum:
- Fungsi bertipe `RETURNS TABLE` mengembalikan **array baris**. Untuk fungsi yang hasilnya satu baris (misalnya `dashboard_*_ringkasan`) ambil elemen pertama.
- Parameter tanggal berformat `YYYY-MM-DD`. Jika `p_mulai` dan `p_selesai` dikosongkan, periode = **bulan berjalan** (zona WIB). Tanggal harus `p_mulai <= p_selesai` dan rentang maksimal 10 tahun, kalau tidak ditolak.
- Waktu hasil berformat UTC. Format ke `Asia/Jakarta` di sisi tampilan.

## 1. Data publik (anon)

Boleh dibaca langsung oleh `anon`, tapi tetap sebaiknya lewat endpoint server agar bisa di-cache.

| Kebutuhan | Panggilan |
|---|---|
| Dropdown kabupaten | `from('kabupaten').select('id, nama, jenis, kantor_id').order('nama')` |
| Dropdown kecamatan | `from('kecamatan').select('id, nama').eq('kabupaten_id', kabupatenId).order('nama')` |
| Dropdown desa/kelurahan | `from('desa_kelurahan').select('id, nama, jenis_wilayah').eq('kecamatan_id', kecamatanId).order('nama')` |
| Nama kantor yang melayani (ditampilkan di form) | `from('kabupaten').select('nama, kantor:kantor_imigrasi(nama, nama_singkat)').eq('id', kabupatenId).single()` |
| FAQ | `from('faq').select('id, pertanyaan, jawaban').order('urutan')` |

Form masyarakat memakai tiga dropdown berantai: kabupaten → kecamatan → desa/kelurahan. Hanya Riau yang ada di data.

## 2. Kirim laporan masyarakat

**Sisi**: endpoint server, insert dengan `service`. **Bukan** dari browser.

Urutan di server:
1. Validasi input (zod): `nama_pelapor`, `alamat_pelapor`, `desa_kelurahan_id`, `jenis_terlapor`, `isi_laporan` (10–5000), `lintang`, `bujur`, `akurasi_meter` (opsional), foto (opsional, satu file).
2. Rate limit per IP.
3. Jika ada foto: validasi tipe (jpeg/png/webp) dan ukuran (≤ 3 MB), unggah ke bucket `foto-laporan` dengan nama unik (service role).
4. Jika pelapor mengisi kode laporan sebelumnya: cari `id`-nya lewat `kode_pelacakan` (service), lalu isi `laporan_sebelumnya_id`. Tidak ada fungsi database khusus untuk ini.
5. `from('laporan').insert({...}).select('kode_pelacakan').single()` **tanpa** `kantor_id`, `kode_pelacakan`, `status`.
6. Jika insert gagal setelah foto terunggah, hapus foto tadi.
7. Kembalikan hanya `kode_pelacakan` ke browser (untuk dialog kode dan timeline).

Yang dilakukan database sendiri saat insert:
- Kantor tujuan dihitung dari desa → kabupaten dan dikunci.
- Kode pelacakan dibuat (`XXX000`: huruf kantor (`kantor_imigrasi.huruf_kode`) + 2 huruf A–Z acak + 3 digit acak, mis. `PZA512`; unik, dicoba ulang bila bentrok).
- **Lokasi dicek**: di luar Riau ditolak dengan error `22023` dan pesan `Lokasi pelapor berada di luar Provinsi Riau`. Toleransi dan saklar ada di tabel `pengaturan`.
- Baris timeline pertama `diterima` dibuat otomatis.

Endpoint pra-cek opsional untuk UX (mis. memberi tahu pelapor sebelum mengisi form): panggil `rpc('cek_lokasi_riau', { p_lintang, p_bujur })` dengan `service`. Fungsi ini **hanya** boleh dipanggil `service` (tertutup untuk `anon` dan `authenticated`). Hasil `true`/`false`. Koordinat rusak selalu `false`.

## 3. Lacak laporan (masyarakat)

`rpc('lacak_laporan', { p_kode })`, boleh dipanggil `anon`, namun disarankan lewat endpoint server dengan rate limit.

- Kode dinormalkan di database (huruf besar, spasi dibuang). Pelapor boleh mengetik huruf kecil.
- Hasil `null` bila kode tidak ada (jadikan 404).
- Bentuk hasil (jsonb):

```ts
{
  kode_pelacakan: string
  status: Enums<'status_laporan'>
  kantor: string            // nama kantor yang menangani
  dikirim_pada: string      // UTC
  timeline: { status: Enums<'status_laporan'>; keterangan: string | null; waktu: string }[]  // urut waktu
}
```

Tidak ada nama, alamat, isi laporan, maupun petugas. Jangan menambahkannya.

## 4. Akun UPT (semua dengan `sesi-user`)

### 4.1 Laporan masyarakat kantornya
- Daftar (RLS otomatis membatasi ke kantornya sendiri):
  `from('laporan').select('id, kode_pelacakan, status, jenis_terlapor, created_at, desa_kelurahan(nama, kecamatan(nama, kabupaten(nama))), ...').order('created_at', { ascending: false })`
  **Jangan** sertakan `nama_pelapor` dan `alamat_pelapor` di daftar; hanya di halaman detail.
- Detail + timeline: `from('laporan').select('*, riwayat_status(*)').eq('id', id).single()` (urutkan `riwayat_status` menurut `created_at` lalu `status`).
- Foto: server memverifikasi laporan terbaca lewat `sesi-user`, lalu membuat signed URL dari bucket `foto-laporan` dengan `service`.

### 4.2 Ubah status
`rpc('ubah_status_laporan', { p_laporan_id, p_status, p_keterangan })` (`p_pegawai_id` masih diterima tetapi **tidak lagi dikirim**)

- Boleh: `upt` dan `admin`. **Kanwil tidak boleh.** Harus `sesi-user` (service role ditolak karena tanpa identitas).
- Untuk UPT, perubahan otomatis dicatat di `riwayat_status.diproses_oleh` sebagai `Humas Imigrasi {NAMA UPT}` dan menandai laporan dibaca. Tidak ada pemilihan petugas. Untuk admin, `diproses_oleh` kosong (UI: "Admin").
- Alur status (loncat dan mundur ditolak):

| Dari | Ke |
|---|---|
| `diterima` | `diverifikasi`, `ditolak` |
| `diverifikasi` | `ditindaklanjuti`, `ditolak` |
| `ditindaklanjuti` | `selesai` |
| `selesai`, `ditolak` | final (tidak bisa diubah) |

- `p_keterangan` **wajib** untuk `ditolak` dan `selesai`, opsional untuk lainnya, maksimal 1000 karakter. Keterangan tampil ke pelapor.
- Laporan milik kantor lain dijawab `Laporan tidak ditemukan` (sama dengan id yang tidak ada).
- Satu transaksi: update `laporan.status` + insert `riwayat_status`. Jangan update `laporan.status` langsung.
- Status `diterima` dibuat sistem, jangan dikirim.

### 4.2a Tandai dibaca (khusus UPT, dipanggil server)

`rpc('tandai_dibaca', { p_laporan_id })` dengan client sesi user, saat akun UPT membuka detail aduan (`GET /api/upt/laporan/[id]`).

- Hanya berdampak untuk `upt` pemilik laporan; peran lain dan laporan kantor lain **diabaikan tanpa galat**.
- Idempotent: yang tercatat hanya pembukaan **pertama**. Kegagalan mencatat tidak boleh menghalangi UPT membaca aduan.
- Pembacaan penanda: `from('laporan_dibaca').select('laporan_id, dibaca_pada').in('laporan_id', ids)` hanya oleh Kanwil/admin (RLS menolak akun lain). Endpoint server Kanwil melampirkan `dibaca_pada` pada daftar laporan, detail, dan pantauan; endpoint UPT **tidak pernah** memuatnya.

### 4.3 Pegawai kantornya
- Baca/tambah/ubah langsung di tabel `pegawai` dengan `kantor_id` = kantor akun. Nonaktifkan dengan `aktif = false`. Tidak bisa pindah kantor dan tidak bisa dinonaktifkan selagi punya penugasan aktif (ditolak trigger; minta Kanwil mengakhiri penugasan dulu).
- Pegawai dipakai untuk penugasan PIMPASA dan dropdown petugas pada laporan kegiatan (dibatasi ke PIMPASA desa itu, dihitung dari `desa_binaan_pegawai`).

### 4.4 Laporan kegiatan PIMPASA
Insert dengan `sesi-user`:

```ts
from('laporan_pimpasa').insert({
  tanggal_kegiatan,        // YYYY-MM-DD, tidak boleh masa depan
  desa_id,                 // desa DBI di wilayah kantornya (NAMA KOLOM: desa_id)
  pegawai_id,              // rekan sekantor, aktif
  jenis_kegiatan_id,
  jumlah_peserta,          // 0–100000
  uraian_hasil,            // 10–5000 karakter
  foto_path,               // opsional
  pdf_path,                // opsional
})
```

**Jangan kirim** `kantor_id`, `dibuat_oleh`. `pegawai_id` wajib PIMPASA yang ditugaskan di desa itu pada `tanggal_kegiatan` (ditolak trigger bila tidak). `petugas_pengganti_nama` (teks bebas, opsional, maks. 150) dikirim hanya bila ada pengganti; kosong berarti PIMPASA sendiri yang terjun.

- Edit: UPT boleh mengubah isi laporan kantornya (desa dan kantor tidak bisa diganti).
- **Hapus**: UPT hanya bisa jika `created_at` kurang dari N menit lalu (N = `pengaturan.batas_menit_hapus_laporan`, default 10). Lewat itu, hanya admin. Setelah baris terhapus, **server menghapus file** di Storage dengan `service` (akun user tidak punya policy hapus file).
- Dropdown desa binaan: `from('desa_kelurahan').select('id, nama, kecamatan(nama)').eq('dbi', true)` (RLS publik menampilkan semua desa se-Riau, jadi filter ke wilayah kantor dilakukan lewat `dashboard_upt_desa_binaan()` di bawah, yang sudah memfilter kantor).
- Dropdown jenis kegiatan: `from('jenis_kegiatan').select('id, nama').eq('aktif', true)`.

### 4.5 Dashboard UPT
Semuanya `RETURNS TABLE` (array) kecuali `dashboard_upt_tren` (jsonb). Parameter `p_kantor_id` **diabaikan** untuk UPT (selalu kantornya sendiri).

| Fungsi | Hasil | Untuk bagian dashboard |
|---|---|---|
| `dashboard_upt_ringkasan({ p_kantor_id? })` | 1 baris: `perlu_ditanggapi`, `sedang_ditangani`, `terlambat`, `selesai_ditolak_bulan_ini`, `kegiatan_bulan_ini`, `batas_hari` | 5 kartu |
| `dashboard_upt_perlu_tindakan({ p_kantor_id?, p_limit? })` | laporan `diterima` terlama dulu: `laporan_id`, `kode_pelacakan`, `desa`, `kecamatan`, `jenis_terlapor`, `masuk_pada`, `hari_kerja_berjalan`, `batas_hari`, `sisa_hari_kerja` (**negatif = terlambat**, beri warna merah) | daftar "perlu tindakan" |
| `dashboard_upt_desa_binaan({ p_kantor_id? })` | `desa_id`, `desa`, `kecamatan`, `kabupaten`, `petugas`, `kegiatan_terakhir`, `hari_sejak_kegiatan`, `kegiatan_bulan_ini`; yang belum pernah ada kegiatan paling atas | tabel desa binaan |
| `dashboard_upt_tren({ p_kantor_id?, p_mulai?, p_selesai? })` | jsonb (di bawah) | grafik |

Bentuk `dashboard_upt_tren`:

```ts
{
  periode: { mulai: string; selesai: string }
  laporan_per_bulan: { bulan: string; total: number; wna: number; wni: number }[]   // selalu 6 titik, bulan kosong bernilai 0
  proporsi: { wna: number; wni: number }
  kegiatan_per_jenis: { jenis: string; jumlah: number }[]                            // semua jenis aktif, termasuk yang 0
  kandidat_dbi: { desa_id: string; desa: string; kecamatan: string; jumlah: number }[] // 10 desa non-DBI terbanyak melapor
}
```

Peringkat antar-UPT **tidak ditampilkan** ke UPT.

## 5. Akun Kanwil dan admin (semua dengan `sesi-user`)

Kanwil **read-only** untuk laporan masyarakat dan laporan kegiatan. Admin memakai fungsi yang sama.

### 5.1 Dashboard
| Fungsi | Hasil |
|---|---|
| `dashboard_kanwil_ringkasan({ p_mulai?, p_selesai? })` | 1 baris: `laporan_masuk`, `belum_ditanggapi`, `terlambat`, `sedang_ditangani`, `selesai_periode`, `ditolak_periode`, `kegiatan_periode`, `desa_binaan`, `desa_tanpa_kegiatan`, `pimpasa_aktif`, `batas_hari`, `periode_mulai`, `periode_selesai` |
| `dashboard_kanwil_per_upt({ p_mulai?, p_selesai? })` | satu baris per UPT aktif: `kantor_id`, `kantor`, `laporan_masuk`, `belum_ditanggapi`, `terlambat`, `sedang_ditangani`, `direspon`, `kegiatan`, `desa_binaan`, `desa_tanpa_kegiatan` |
| `dashboard_kanwil_tren({ p_mulai?, p_selesai? })` | jsonb: `periode`, `laporan_per_bulan` (6 titik, ada `wna`/`wni`), `kegiatan_per_bulan` (6 titik), `proporsi`, `kegiatan_per_jenis` |
| `dashboard_admin_status()` | **hanya admin**: `validasi_lokasi_aktif`, `akun_admin`, `akun_kanwil`, `akun_upt`, `akun_nonaktif` |

Untuk fitur "lihat sebagai UPT", admin dan Kanwil memanggil `dashboard_upt_*` dengan `p_kantor_id` terisi. Tanpa `p_kantor_id`, hasilnya kosong.

### 5.2 Peringkat (hanya Kanwil dan admin)
Parameter: `p_mulai?`, `p_selesai?`. Hasil array.

| Fungsi | Kolom hasil | Dasar penghitungan |
|---|---|---|
| `peringkat_upt` | `kantor_id`, `kantor`, `laporan_kegiatan`, `peringkat_kegiatan`, `laporan_direspon`, `peringkat_respons` | kegiatan: jumlah `laporan_pimpasa` menurut `tanggal_kegiatan`. Direspon: laporan yang **pertama kali keluar dari `diterima`** dalam periode (termasuk `ditolak`) |
| `peringkat_kecamatan` | `kecamatan_id`, `kecamatan`, `kabupaten`, `jumlah_laporan`, `peringkat` | laporan masuk per kecamatan |
| `peringkat_desa({ p_hanya_non_dbi? })` | `desa_id`, `desa`, `kecamatan`, `kabupaten`, `dbi`, `jumlah_laporan`, `peringkat` | `p_hanya_non_dbi = true` menghasilkan **kandidat DBI** |

Semua UPT tampil termasuk yang bernilai 0.

### 5.3 Pantauan
`from('v_laporan_belum_ditanggapi').select('*')`: laporan `diterima` yang melewati batas hari kerja. Batas diatur `pengaturan.batas_hari_tanggap`. `hitung_hari_kerja(p_mulai, p_selesai)` (boleh dipanggil user login) menghitung hari kerja Senin–Jumat dikurangi `hari_libur`: hari pertama tidak dihitung, hari terakhir dihitung.

### 5.4 Desa binaan dan penugasan
- Tetapkan desa binaan: `rpc('tetapkan_dbi', { p_desa_id })`.
- Cabut: `rpc('cabut_dbi', { p_desa_id })` → mengembalikan **jumlah penugasan yang ikut ditutup** (alasan `desa_dicabut`). Tampilkan jumlah ini di dialog konfirmasi.
- Keduanya hanya admin dan Kanwil. Jangan `update desa_kelurahan.dbi` langsung.
- Tugaskan PIMPASA: `from('desa_binaan_pegawai').insert({ desa_id, pegawai_id, tanggal_mulai? })`. **Jangan kirim `kantor_id`**: trigger mengisinya dari kantor pegawai (snapshot). Pegawai harus aktif, desa harus DBI, dan kantor pegawai harus yang membawahi wilayah desa tersebut, kalau tidak ditolak dengan pesan `Pegawai bukan dari kantor imigrasi yang membawahi wilayah desa ini`. Gunakan tipe turunan `PenugasanBaru` (bagian 8).
- Akhiri penugasan: `update({ tanggal_selesai, alasan_berakhir })` pada penugasan aktif. Isi `alasan_berakhir` (`rotasi`, `mutasi`, `desa_dicabut`, `lainnya`) hanya bersama `tanggal_selesai`.
- Koreksi tanggal: `tanggal_mulai` dan `tanggal_selesai` boleh diubah untuk memperbaiki salah input. `desa_id`, `pegawai_id`, dan `kantor_id` **terkunci** (ditolak trigger dengan pesan `Desa, pegawai, dan kantor pada penugasan tidak bisa diubah. Akhiri penugasan lalu buat yang baru`). Untuk mengganti desa atau petugas: akhiri yang lama, lalu buat baru.
- Isi tanggal dengan zona `Asia/Jakarta`, bukan tanggal UTC server, supaya `tanggal_selesai` tidak lebih awal dari `tanggal_mulai`.
- Penugasan tidak bisa dihapus; "menyembunyikan" berarti mengisi `tanggal_selesai`, dan UI menampilkannya sebagai nonaktif.
- Persetujuan Kanwil atas usulan UPT **belum ada di aplikasi** (prosesnya berjalan di luar sistem; Kanwil yang mencatat hasilnya).

### 5.5 Ubah wilayah kerja
`rpc('ubah_wilayah_kerja', { p_kabupaten_id, p_kantor_id })` → mengembalikan **jumlah penugasan PIMPASA yang ditutup**. Hanya admin dan Kanwil. Tabel `kabupaten` tidak bisa diupdate langsung.

- Laporan masyarakat lama **tetap** di UPT lama.
- Setelah dipindah, desa binaan di kabupaten itu **tanpa PIMPASA aktif**; Kanwil perlu menugaskan petugas baru dari kantor tujuan. Dialog konfirmasi sebaiknya menampilkan perkiraan dampaknya.
- Ditolak jika kabupaten tidak ada, kantor tidak valid, atau kantor sama.

### 5.6 Pengaturan, FAQ, jenis kegiatan, hari libur
- `pengaturan`: update `nilai` per `kunci`. Kanwil tidak bisa mengubah `validasi_lokasi_aktif` (update diabaikan, 0 baris).
- `faq`: insert/update/delete oleh admin dan Kanwil.
- `jenis_kegiatan`: insert/update oleh admin dan Kanwil; nonaktifkan dengan `aktif = false`.
- `hari_libur`: UI ditunda. Tabelnya sudah siap (admin/Kanwil: insert/update/delete).

## 6. Storage

Unggah **dengan `sesi-user`** untuk bucket kegiatan; lewat server untuk bucket laporan masyarakat.

| Bucket | Siapa mengunggah | Path | Catatan |
|---|---|---|---|
| `foto-laporan` | server (service) | bebas, unik | tanpa policy; baca lewat signed URL dari server |
| `foto-kegiatan` | akun UPT | `{kantor_id}/{uuid}.{ext}` | ditolak jika folder bukan kantor akun |
| `laporan-pdf` | akun UPT | `{kantor_id}/{uuid}.{ext}` | maks 8 MB, hanya PDF |

Batas ukuran dan tipe dijaga layanan Storage saat unggah, jadi pesan penolakan berasal dari API Storage (tangani di UI). Tidak ada policy ganti/hapus untuk akun user.
Kanwil dan admin membaca semua file kegiatan; UPT hanya miliknya. Untuk menampilkan, minta signed URL.

## 7. Akun dan admin (jalur server, `service`)

Dikerjakan nanti di tahap akhir, lewat Admin API Supabase dari server (service role key tidak pernah ke browser):
- Buat akun: `email = ${username}@${AUTH_EMAIL_DOMAIN}`, `email_confirm: true`, lalu insert baris `profiles` (peran dan `kantor_id` harus konsisten: `kantor_id` wajib hanya untuk `upt`).
- Reset password manual oleh admin. **Password tidak pernah disimpan atau ditampilkan.**
- Impersonasi untuk pengujian: `auth.admin.generateLink({ type: 'magiclink', email })` (tidak butuh SMTP). Setiap impersonasi harus tercatat saat log diaktifkan.

## 8. Tipe turunan yang disarankan (`shared/types/`)

Tipe `Insert` hasil generate menandai kolom yang sebenarnya diisi trigger sebagai wajib. Gunakan tipe turunan agar jujur terhadap perilaku database:

```ts
import type { TablesInsert } from './database.types'

/** Isian form masyarakat; kantor_id, kode_pelacakan, status diisi database */
export type LaporanBaru = Omit<
  TablesInsert<'laporan'>,
  'id' | 'kantor_id' | 'kode_pelacakan' | 'status' | 'created_at' | 'updated_at'
>

/** Isian laporan kegiatan PIMPASA; kantor_id, dibuat_oleh diisi database */
export type LaporanPimpasaBaru = Omit<
  TablesInsert<'laporan_pimpasa'>,
  'id' | 'kantor_id' | 'dibuat_oleh' | 'created_at' | 'updated_at'
>

/** Isian penugasan PIMPASA; kantor_id diisi trigger dari kantor pegawai */
export type PenugasanBaru = Omit<
  TablesInsert<'desa_binaan_pegawai'>,
  'id' | 'kantor_id' | 'tanggal_selesai' | 'alasan_berakhir' | 'created_at' | 'updated_at'
>
```

Saat memanggil `.insert()`, tambahkan cast yang terlokalisasi di dalam satu fungsi model (bukan tersebar), karena supabase-js tetap menuntut kolom wajib menurut tipe `Insert`.

## 9. Pesan error

Pesan dari database berbahasa Indonesia dan aman ditampilkan. Kode umum:

| Kode | Arti | Contoh pesan |
|---|---|---|
| `42501` | tidak berwenang | `Hanya admin yang boleh melihat status sistem`, `Hanya Kanwil atau admin yang boleh melihat peringkat` |
| `22023` | nilai tidak valid | `Lokasi pelapor berada di luar Provinsi Riau` |
| `23505` | data ganda | penugasan aktif ganda, nama pegawai ganda di kantor yang sama |
| `42501` dari RLS / `permission denied` | hak akses | tabel atau fungsi yang tidak boleh diakses peran itu |
| (aturan bisnis lain) | | `Laporan tidak ditemukan`, `Pegawai bukan dari kantor imigrasi yang membawahi wilayah desa ini` |

Perilaku yang sering membingungkan:
- **UPDATE/DELETE yang diblokir RLS tidak melempar error**, hanya mengubah 0 baris. Selalu cek jumlah baris terdampak, jangan menganggap sukses.
- `anon` yang memanggil fungsi yang tidak diizinkan mendapat `permission denied for function ...`.

## 10. Usulan route server

Tipis; logika di controller, query di model (lihat AGENTS.md bagian 4).

| Route | Metode | Client | Isi |
|---|---|---|---|
| `/api/publik/wilayah` | GET | anon/service | dropdown kabupaten/kecamatan/desa (parameter induk) |
| `/api/publik/faq` | GET | anon | daftar FAQ |
| `/api/publik/laporan` | POST | service | kirim laporan (bagian 2) + rate limit |
| `/api/publik/laporan/lacak` | POST/GET | service | `lacak_laporan` + rate limit |
| `/api/publik/lokasi/cek` | POST | service | `cek_lokasi_riau` (opsional) |
| `/api/auth/login` | POST | anon | `signInWithPassword` dengan email dari username |
| `/api/upt/laporan`, `/api/upt/laporan/[id]` | GET | sesi-user | daftar, detail, dan foto (signed URL) |
| `/api/upt/laporan/[id]/status` | POST | sesi-user | `ubah_status_laporan` |
| `/api/upt/pegawai` | GET/POST/PATCH | sesi-user | kelola pegawai kantor |
| `/api/upt/kegiatan` | GET/POST/PATCH/DELETE | sesi-user (+ service untuk hapus file) | laporan kegiatan PIMPASA |
| `/api/upt/dashboard/*` | GET | sesi-user | `dashboard_upt_*` |
| `/api/kanwil/dashboard/*`, `/api/kanwil/peringkat/*` | GET | sesi-user | dashboard dan peringkat |
| `/api/kanwil/dbi`, `/api/kanwil/penugasan`, `/api/kanwil/wilayah-kerja` | POST | sesi-user | `tetapkan_dbi`, `cabut_dbi`, penugasan, `ubah_wilayah_kerja` |
| `/api/pengaturan`, `/api/faq`, `/api/jenis-kegiatan` | GET/PATCH/POST | sesi-user | pengaturan dan konten |
| `/api/admin/akun/*` | POST | service | tahap akhir: buat akun, reset password, impersonasi |

Setiap route non-publik harus memeriksa peran dari sesi sebelum memanggil controller (middleware), walaupun database sudah membatasi lewat RLS. Dua lapis lebih mudah di-debug.
