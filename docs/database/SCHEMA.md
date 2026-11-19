# SCHEMA — Database SAPA DESA

Sumber: project Supabase `SAPA DESA`, migrasi 001 sampai 021 (kondisi saat dokumen dibuat). Jika dokumen ini berbeda dengan database, **database yang benar**.

Keterangan: **M** = wajib, **O** = boleh kosong. "Default" artinya kolom boleh tidak dikirim.

## 1. Konvensi

- Semua `id` tabel transaksi bertipe `uuid` (default `gen_random_uuid()`). Pengecualian: tabel wilayah (`kabupaten`, `kecamatan`, `desa_kelurahan`) memakai **kode wilayah Kemendagri bertingkat bertipe `text`** sebagai PK (contoh `14.71`). `profiles.id` = `auth.users.id`.
- Waktu `timestamptz` disimpan UTC. Tampilkan dengan zona `Asia/Jakarta`.
- Hampir semua tabel punya `created_at` dan `updated_at`; `updated_at` diisi trigger `set_updated_at`, jangan dikirim.
- Tidak ada policy **DELETE** kecuali yang disebut eksplisit (`faq`, `hari_libur`, `laporan_pimpasa`). Data dinonaktifkan (`aktif = false`), bukan dihapus.
- Semua tabel `public` memakai RLS. Akun `anon` hanya bisa membaca tabel yang ditandai "publik".
- Fungsi pembantu di schema `private` (`peran_saya()`, `kantor_saya()`, dll.) tidak bisa dipanggil dari API.

## 2. Enum

| Enum | Nilai |
|---|---|
| `peran_pengguna` | `admin`, `kanwil`, `upt` |
| `status_laporan` | `diterima`, `diverifikasi`, `ditindaklanjuti`, `selesai`, `ditolak` (urutan = urutan timeline) |
| `jenis_terlapor` | `wna`, `wni` |
| `jenis_daerah` | `kabupaten`, `kota` |
| `jenis_wilayah_desa` | `desa`, `kelurahan`, `kampung`, `kepenghuluan` |
| `alasan_berakhir_penugasan` | `rotasi`, `mutasi`, `desa_dicabut`, `lainnya` |

## 3. Diagram relasi (ringkas)

```
kantor_imigrasi 1─N kabupaten 1─N kecamatan 1─N desa_kelurahan
kantor_imigrasi 1─N pegawai
kantor_imigrasi 1─N profiles            (hanya peran upt)
kantor_imigrasi 1─N laporan             (snapshot kantor tujuan)
desa_kelurahan  1─N laporan
laporan         1─N riwayat_status      (isi timeline)
laporan         1─N laporan             (laporan_sebelumnya_id, laporan lanjutan)
pegawai ─N:M─ desa_kelurahan            lewat desa_binaan_pegawai (riwayat penugasan)
kantor_imigrasi 1─N laporan_pimpasa     N─1 desa_kelurahan, pegawai, jenis_kegiatan, profiles
```

Desa binaan **bukan tabel terpisah**: itu `desa_kelurahan` dengan `dbi = true`.

## 4. Tabel

### 4.1 `kantor_imigrasi` (publik, tanpa policy tulis)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| kode | text | M, unique | `pekanbaru`, `dumai`, `siak`, `bengkalis`, `inhil`, `meranti`, `rohil` |
| nama | text | M | contoh "Kantor Imigrasi Kelas I TPI Dumai" |
| nama_singkat | text | M | contoh "Kanim Dumai" |
| huruf_kode | char(1) | M, unique, `^[A-Z]$` | huruf awal kode pelacakan aduan: Pekanbaru `P`, Dumai `D`, Rokan Hilir `R`, Bengkalis `B`, Siak `S`, Indragiri Hilir `I`, Kepulauan Meranti `M` |
| aktif | boolean | default true | |

### 4.2 `kabupaten` (publik)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | text | PK | kode wilayah |
| nama | text | M | |
| jenis | jenis_daerah | M | `kabupaten` / `kota` |
| kantor_id | uuid | M, FK → kantor_imigrasi | **UPT pelayan wilayah ini**. Berubah hanya lewat `ubah_wilayah_kerja()` |

12 kabupaten/kota Riau. Pemetaan: Pekanbaru, Kampar, Pelalawan, Rokan Hulu → Kanim Pekanbaru; Indragiri Hilir, Indragiri Hulu, Kuantan Singingi → Kanim Indragiri Hilir; Bengkalis, Kepulauan Meranti, Rokan Hilir, Siak, Dumai → masing-masing satu Kanim.

### 4.3 `kecamatan` (publik)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | text | PK | kode wilayah |
| kabupaten_id | text | M, FK → kabupaten | |
| nama | text | M | unique per kabupaten |

172 baris.

### 4.4 `desa_kelurahan` (publik)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | text | PK | kode wilayah |
| kecamatan_id | text | M, FK → kecamatan | |
| nama | text | M | unique bersama `(kecamatan_id, nama, jenis_wilayah)`. Nama yang sama boleh ada sebagai kelurahan **dan** desa dalam satu kecamatan (contoh: "Panipahan" di Kecamatan Panipahan, kode `14.07.06.1007` dan `14.07.06.2001`). Jangan mengidentifikasi desa dari nama saja; pakai `id` |
| jenis_wilayah | jenis_wilayah_desa | M | |
| dbi | boolean | default false | **Desa Binaan Imigrasi**. Ubah hanya lewat `tetapkan_dbi()` / `cabut_dbi()` |

1.862 baris, 18 di antaranya `dbi = true`. Kabupaten dan kantor ditelusuri lewat join desa → kecamatan → kabupaten.

Aturan `dbi`:
- Admin dan Kanwil mengubahnya **hanya lewat `tetapkan_dbi()` dan `cabut_dbi()`**. Aplikasi tidak boleh `update desa_kelurahan.dbi` langsung.
- `cabut_dbi()` menutup semua penugasan aktif di desa itu (alasan `desa_dicabut`) lalu mengubah `dbi` menjadi `false`. Trigger `cek_dbi` menolak pencabutan langsung selagi masih ada penugasan aktif.
- Catatan kondisi database saat ini: policy `desa_kelurahan_ubah_admin` masih mengizinkan admin update langsung. Itu tidak dipakai aplikasi; bila policy itu dihapus, tidak ada perubahan pada aplikasi.

### 4.5 `profiles`

Akun login (satu akun per UPT, bukan per pegawai).

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | = `auth.users.id` |
| username | text | M, unique | huruf kecil, `a-z 0-9 . _ -` |
| nama_tampil | text | M | |
| peran | peran_pengguna | M | |
| kantor_id | uuid | FK → kantor_imigrasi | **wajib jika `upt`, kosong jika admin/kanwil** (CHECK) |
| aktif | boolean | default true | akun nonaktif kehilangan semua akses data seketika |

Akun: `admin`, `kanwil_riau`, `imigrasi_pekanbaru`, `imigrasi_siak`, `imigrasi_dumai`, `imigrasi_rokanhilir`, `imigrasi_bengkalis`, `imigrasi_inhil`, `imigrasi_meranti`. Email login = `username@sapadesa.com`. Akun Rudenim ditunda.

### 4.6 `pegawai`

Daftar pegawai kantor (dipakai untuk penugasan PIMPASA dan dropdown petugas pada laporan kegiatan, dibatasi ke PIMPASA desa itu). Tidak punya login.

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| kantor_id | uuid | M, FK → kantor_imigrasi | |
| nama | text | M | unique per kantor |
| nip | text | O | |
| aktif | boolean | default true | |

Trigger `pegawai_cek`: pindah kantor (mutasi) hanya admin; pegawai tidak bisa dinonaktifkan selagi punya penugasan aktif.

### 4.7 `desa_binaan_pegawai`

Riwayat penugasan PIMPASA (banyak-ke-banyak pegawai dan desa).

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| desa_id | text | M, FK → desa_kelurahan | harus `dbi = true` |
| pegawai_id | uuid | M, FK → pegawai | harus aktif |
| kantor_id | uuid | FK → kantor_imigrasi | **diisi trigger** dari kantor pegawai saat penugasan dibuat (snapshot, kiriman klien ditimpa). Kantor itu harus yang membawahi wilayah desa, kalau tidak ditolak |
| tanggal_mulai | date | default hari ini (WIB) | |
| tanggal_selesai | date | O | **kosong = masih bertugas** |
| alasan_berakhir | alasan_berakhir_penugasan | O | hanya boleh terisi jika `tanggal_selesai` terisi |

Aturan:
- Satu pegawai tidak bisa punya dua penugasan aktif di desa yang sama (unique index parsial).
- **Terkunci** (ditolak trigger bila diubah): `desa_id`, `pegawai_id`, `kantor_id`. Untuk mengganti desa atau petugas, akhiri penugasan lama lalu buat yang baru.
- **Boleh diubah**: `tanggal_mulai`, `tanggal_selesai`, `alasan_berakhir` (untuk mengakhiri penugasan atau mengoreksi tanggal salah input). Constraint tetap menjaga `tanggal_selesai >= tanggal_mulai` dan `alasan_berakhir` hanya boleh terisi jika `tanggal_selesai` terisi.
- Penugasan tidak pernah dihapus (tidak ada policy DELETE); riwayat dijaga lewat `tanggal_selesai`.
- `cabut_dbi()` dan `ubah_wilayah_kerja()` menutup penugasan aktif otomatis.
- Tanggal selalu memakai zona `Asia/Jakarta` (default `tanggal_mulai` sudah WIB; `current_date` di server adalah UTC dan bisa membuat tanggal selesai lebih awal dari tanggal mulai).

### 4.8 `laporan` (laporan masyarakat)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| kode_pelacakan | text | unique, **diisi trigger** | format `XXX000` (check `^[A-Z]{3}[0-9]{3}$`): `kantor_imigrasi.huruf_kode` + 2 huruf A–Z acak + 3 digit acak, mis. `PZA512`. Dibuat `private.buat_kode_pelacakan(huruf)`, dicoba ulang maks. 10 kali bila bentrok |
| nama_pelapor | text | M | 1–150 karakter |
| alamat_pelapor | text | M | 1–500 karakter |
| desa_kelurahan_id | text | M, FK → desa_kelurahan | kecamatan dan kabupaten ikut lewat relasi |
| kantor_id | uuid | FK → kantor_imigrasi | **diisi trigger** dari desa → kabupaten, lalu dikunci (laporan tidak pindah UPT jika wilayah kerja berubah) |
| jenis_terlapor | jenis_terlapor | M | |
| isi_laporan | text | M | 10–5000 karakter |
| lintang | double precision | M | −90..90 |
| bujur | double precision | M | −180..180 |
| akurasi_meter | real | O | ≥ 0 |
| foto_path | text | O | path di bucket `foto-laporan`, maksimal 1 foto |
| status | status_laporan | default `diterima` | **hanya berubah lewat `ubah_status_laporan()`** |
| laporan_sebelumnya_id | uuid | O, FK → laporan | untuk laporan lanjutan |

Trigger:
- `laporan_sebelum_insert`: mengisi `kantor_id` dan `kode_pelacakan`, memaksa `status = diterima`, dan **menolak lokasi di luar Riau** (memanggil `cek_lokasi_riau`).
- `laporan_sesudah_insert`: membuat baris pertama `riwayat_status` (`diterima`).
- `laporan_cek_ubah`: setelah dikirim, isi laporan terkunci; hanya `status` yang boleh berubah.

Catatan tipe TypeScript: tipe `Insert` menandai `kantor_id` dan `kode_pelacakan` wajib padahal diisi trigger. Saat insert, **jangan kirim** keduanya; gunakan tipe turunan (lihat KONTRAK_API.md bagian 8).

### 4.9 `riwayat_status` (isi timeline)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| laporan_id | uuid | M, FK → laporan | |
| status | status_laporan | M | |
| keterangan | text | O | maksimal 1000 karakter, **tampil publik ke pelapor** |
| pegawai_id | uuid | O, FK → pegawai | **tidak lagi diisi** (UPT tidak memilih petugas); hanya baris lama yang berisi. Kosong untuk `diterima` |
| diproses_oleh | text | O | snapshot jabatan pemroses, diisi `ubah_status_laporan` untuk UPT: `Humas Imigrasi {NAMA UPT}` (mis. `Humas Imigrasi Siak`; nama UPT = `kantor_imigrasi.nama_singkat` tanpa awalan "Kanim"). Kosong untuk `diterima` dan perubahan oleh admin. **Tidak ada di hasil `lacak_laporan`** (tidak tampil ke masyarakat) |
| dibuat_oleh | uuid | O, FK → profiles | akun yang mengubah. Kosong hanya untuk `diterima` (CHECK) |
| created_at | timestamptz | | waktu di sisi kiri garis timeline |

**Permanen**: trigger `riwayat_status_kunci` menolak update dan delete oleh siapa pun.

### 4.9a `laporan_dibaca` (penanda dibaca, hanya pemantauan Kanwil/admin)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| laporan_id | uuid | PK, FK → laporan (on delete cascade) | |
| dibaca_pada | timestamptz | default `now()` | waktu **pertama** akun UPT pemilik membuka detail aduan |
| dibaca_oleh | uuid | M | `auth.uid()` akun UPT (akun kantor dipakai bersama, jadi tidak mengidentifikasi orang) |

- RLS aktif; **select hanya `admin` dan `kanwil`**. Tanpa policy insert/update/delete: satu-satunya jalur tulis adalah fungsi `tandai_dibaca()` dan `ubah_status_laporan()` (SECURITY DEFINER).
- Hanya akun `upt` pemilik laporan yang tercatat; Kanwil dan admin yang membuka detail **tidak** menandai.
- Mengubah status oleh UPT otomatis mengisi baris ini bila belum ada, sehingga tidak ada laporan berstatus `diverifikasi` yang tercatat belum dibaca.

### 4.10 `jenis_kegiatan`

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| nama | text | M, unique | maksimal 100 karakter |
| aktif | boolean | default true | |

Data awal (7): Deteksi Dini, Lainnya, Konsultasi Masyarakat, Pemantauan Wilayah, Sosialisasi Keimigrasian, Pencegahan TPPO/PMI Non-Prosedural, Koordinasi.

### 4.11 `laporan_pimpasa` (laporan kegiatan PIMPASA oleh UPT)

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| tanggal_kegiatan | date | M | tidak boleh di masa depan |
| kantor_id | uuid | FK → kantor_imigrasi | **diisi dari akun login** (kiriman klien diabaikan) |
| desa_id | text | M, FK → desa_kelurahan | harus DBI dan di wilayah kerja kantor itu. **Perhatikan nama kolom: `desa_id`, bukan `desa_kelurahan_id`** |
| dibuat_oleh | uuid | FK → profiles | **diisi dari akun login** |
| jenis_kegiatan_id | uuid | M, FK → jenis_kegiatan | |
| jumlah_peserta | integer | M | 0–100000 di database; aplikasi mewajibkan minimal 1 |
| uraian_hasil | text | M | 10–5000 karakter (uraian, hasil, tindak lanjut) |
| foto_paths | text[] | M, default `{}` | path di bucket `foto-kegiatan`, **maksimal 3** (check `cardinality <= 3`), tanpa duplikat, tiap path diawali folder kantor (dijaga trigger `laporan_pimpasa_cek`) |
| pdf_path | text | O | path di bucket `laporan-pdf` |
| pegawai_id | uuid | FK → pegawai, NOT NULL | **wajib PIMPASA yang ditugaskan di desa itu pada `tanggal_kegiatan`** (dijaga trigger `laporan_pimpasa_cek`), aktif dan satu kantor |
| petugas_pengganti_nama | text | opsional, maks. 150 | nama petugas yang menggantikan PIMPASA (teks bebas, atas perintah KASI INTELDAKIM). Spasi saja dijadikan NULL. NULL = PIMPASA sendiri yang terjun; UI menyembunyikannya |

Trigger `laporan_pimpasa_cek` memaksakan semua aturan di atas, termasuk: path file harus diawali folder `kantor_id` akun, dan `desa_id`/`kantor_id` tidak bisa diganti saat update.

### 4.12 `pengaturan`

Pasangan kunci-nilai (nilai bertipe teks, ada CHECK format).

| Kunci | Nilai awal | Aturan nilai | Siapa yang boleh ubah |
|---|---|---|---|
| `batas_hari_tanggap` | `7` | bilangan bulat 1–999 | admin, kanwil |
| `batas_menit_hapus_laporan` | `10` | bilangan bulat 1–999 | admin, kanwil |
| `toleransi_batas_meter` | `1000` | 0–99999 | admin, kanwil |
| `validasi_lokasi_aktif` | `true` | `true`/`false` | **hanya admin** (saklar pengujian) |

### 4.13 `hari_libur`

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| tanggal | date | PK | |
| keterangan | text | M | |
| dibuat_oleh | uuid | O, FK → profiles | |

Saat ini kosong dan UI-nya ditunda; fungsi hari kerja otomatis Senin–Jumat bila kosong.

### 4.14 `faq`

| Kolom | Tipe | | Keterangan |
|---|---|---|---|
| id | uuid | PK | |
| pertanyaan | text | M | maksimal 250 karakter |
| jawaban | text | M | maksimal 5000 karakter |
| urutan | integer | default 0 | ≥ 0 |

Kosong saat ini; diisi admin/Kanwil lewat dashboard (rencana awal: apa itu Timpora, Pimpasa, TPPO/TPPM, paspor, izin tinggal).

### 4.15 `log_aktivitas`

Audit log, **nonaktif sampai production** (11 trigger `catat_*` berstatus disabled). Hanya admin yang bisa membaca. Tidak bisa diubah atau dihapus. Kolom: `id`, `waktu`, `akun_id`, `username`, `peran`, `kantor_id`, `pegawai_id`, `pegawai_nama`, `aksi` (`tambah`/`ubah`/`hapus`/`lainnya`), `tabel`, `baris_id`, `data_lama`, `data_baru`, `keterangan`. Tidak ada foreign key (identitas disalin sebagai teks).

### 4.16 `wilayah_riau`

Satu baris poligon batas Riau (PostGIS, SRID 4326). **Tanpa policy**: tertutup dari API, hanya dibaca fungsi `cek_lokasi_riau`. Jangan diakses dari aplikasi.

## 5. View

### `v_laporan_belum_ditanggapi` (`security_invoker`)

Laporan berstatus `diterima` yang melewati `batas_hari_tanggap` hari kerja. Kolom: `id`, `kode_pelacakan`, `kantor_id`, `kantor`, `kabupaten`, `kecamatan`, `desa_kelurahan_id`, `desa`, `jenis_terlapor`, `masuk_pada`, `hari_kerja_berjalan`, `batas_hari`. RLS berlaku: UPT hanya melihat kantornya, Kanwil dan admin semua.

## 6. Storage

Semua bucket privat.

| Bucket | Batas | Tipe | Aturan akses |
|---|---|---|---|
| `foto-laporan` | 3 MB | jpeg, png, webp | **tanpa policy**: hanya server (service role). Baca lewat signed URL setelah server memverifikasi akses |
| `foto-kegiatan` | 3 MB | jpeg, png, webp | UPT unggah ke folder kantornya `{kantor_id}/…`; UPT membaca kantornya sendiri; Kanwil dan admin membaca semua |
| `laporan-pdf` | 8 MB | application/pdf | sama dengan `foto-kegiatan` |

Konvensi path: `{kantor_id}/{uuid}.{ext}` dengan nama file **unik**. Tidak ada policy ganti atau hapus untuk akun user; salah unggah diperbaiki dengan mengunggah file baru lalu memperbarui `foto_paths`/`pdf_path`. Penghapusan file lama dilakukan server (service role). Di VPS, `FILE_SIZE_LIMIT` global Storage tidak boleh lebih kecil dari 8 MB.

## 7. Hak akses per tabel (ringkas)

| Tabel | anon | upt | kanwil | admin |
|---|---|---|---|---|
| kantor_imigrasi, kabupaten, kecamatan, desa_kelurahan, faq | baca | baca | baca | baca |
| kantor_imigrasi, kabupaten, kecamatan | – | – | – | – (tulis tidak ada; wilayah lewat fungsi) |
| desa_kelurahan | – | – | `dbi` via fungsi | `dbi` via fungsi (jangan update langsung) |
| faq | – | – | tambah, ubah, hapus | tambah, ubah, hapus |
| profiles | – | baris sendiri | baris sendiri | semua (baca). Penulisan hanya lewat server |
| pegawai | – | kantornya: baca, tambah, ubah | semua: baca, tambah, ubah | semua + mutasi antar kantor |
| desa_binaan_pegawai | – | kantornya: baca | semua: baca, tambah, ubah | semua: baca, tambah, ubah |
| laporan, riwayat_status | – | baca kantornya | baca semua | baca semua |
| laporan_dibaca | – | – (tidak bisa baca) | baca | baca |
| laporan_pimpasa | – | baca/tambah/ubah kantornya; hapus kantornya dalam N menit | baca semua (read-only) | baca, tambah, ubah, hapus kapan saja |
| jenis_kegiatan | – | baca | baca, tambah, ubah | baca, tambah, ubah |
| pengaturan | – | baca | baca, ubah (kecuali `validasi_lokasi_aktif`) | baca, ubah semua |
| hari_libur | – | baca | baca, tambah, ubah, hapus | baca, tambah, ubah, hapus |
| log_aktivitas | – | – | – | baca |
| wilayah_riau | – | – | – | – (tanpa policy) |

`insert` ke `laporan` dan perubahan `status` tidak punya policy untuk peran mana pun; jalurnya hanya server (service role) untuk insert dan fungsi `ubah_status_laporan` untuk status.

## 7a. Kolom yang diisi database (jangan dikirim dari klien)

| Tabel | Kolom |
|---|---|
| semua | `id` (default), `created_at`, `updated_at` |
| laporan | `kode_pelacakan`, `kantor_id`, `status` |
| riwayat_status | seluruh baris dibuat oleh trigger/fungsi (termasuk `diproses_oleh`) |
| laporan_dibaca | seluruh baris dibuat fungsi `tandai_dibaca` / `ubah_status_laporan` |
| laporan_pimpasa | `kantor_id`, `dibuat_oleh` |
| desa_binaan_pegawai | `kantor_id` (diisi trigger dari kantor pegawai), `tanggal_mulai` (default hari ini WIB), `alasan_berakhir` hanya saat menutup |
