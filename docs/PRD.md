# PRD — SAPA DESA (Spesifikasi Tampilan dan Perilaku)

Dokumen ini menjelaskan **apa yang dilihat dan dilakukan pengguna di setiap halaman**. Data, aturan, dan hak akses ada di dokumen lain; PRD ini tidak mengulanginya, hanya merujuk.

| Dokumen | Isi | Dibaca untuk |
|---|---|---|
| `AGENTS.md` | Stack, struktur MVC, aturan keamanan, gaya kode | Cara membangun |
| `docs/database/SCHEMA.md` | Tabel, kolom, aturan database | Bentuk data |
| `docs/database/KONTRAK_API.md` | Setiap panggilan ke database: siapa boleh, di sisi mana | Sumber data tiap halaman |
| **`docs/PRD.md` (ini)** | Halaman, komponen, teks, perilaku | Isi dan tampilan |

Jika PRD berbeda dengan database, **database yang benar**. Jika ada yang tidak jelas atau butuh perubahan database, berhenti dan tanyakan ke pemilik project (AGENTS.md bagian 7).

Tanda dalam dokumen ini: **[USULAN]** = nilai usulan yang belum diputuskan pemilik project; dibuat mudah diganti dari satu file konfigurasi. **[DITUNDA]** = sengaja belum dibuat, jangan dibuat sendiri.

---

## 1. Ringkasan produk

SAPA DESA adalah website pelayanan Kantor Wilayah Kemenimipas Riau dan 7 Kantor Imigrasi (UPT) di Riau.

| Pengguna | Tujuan | Perangkat utama |
|---|---|---|
| **Masyarakat** (tanpa akun) | Membaca informasi keimigrasian, melapor WNA/WNI yang mencurigakan, memantau laporannya | **HP** (scan QR di titik desa) |
| **UPT** (1 akun per kantor, dipakai bersama) | Menangani laporan yang masuk, mencatat kegiatan PIMPASA di desa binaan | Laptop atau PC kantor, kadang tablet |
| **Kanwil** | Memantau kinerja UPT, mengelola desa binaan, penugasan, dan wilayah kerja | Laptop atau PC |
| **Admin** (pemilik project) | Semua hak Kanwil + mengubah status laporan, pengaturan sistem, akun, log | Laptop atau PC |

Prinsip produk:
1. **Masyarakat cukup scan lalu lapor.** Tanpa akun, tanpa istilah teknis, selesai dalam beberapa menit di HP.
2. **Dashboard UPT adalah daftar kerja**, bukan laporan statistik: apa yang harus ditindak sekarang, apa yang hampir telat, desa mana yang belum dikunjungi.
3. **Dashboard Kanwil adalah alat memantau**, bukan alat mengubah kerja UPT. Kanwil tidak mengubah status laporan. Admin boleh, karena database mengizinkannya (8.4).
4. Antar-UPT tidak saling membandingkan angka. **Peringkat tidak ditampilkan ke akun UPT.**

---

## 2. Identitas visual

### 2.1 Token warna (satu sumber)

Semua nilai warna ditulis **satu kali** di `shared/config/tema.ts`. File CSS (`app/assets/css/tailwind.css`) dan komponen **tidak boleh** menulis ulang kode hex. Nilai dari config disuntikkan sebagai variabel CSS saat render (SSR) agar tidak ada kedipan warna, lalu `tailwind.css` hanya memetakan nama variabel ke utilitas Tailwind (pola standar shadcn). `tailwind.css` menerapkan latar dan teks halaman lewat `--background` dan `--foreground`.

Palet utama dari pemilik project:

| Nama | Hex | Peran |
|---|---|---|
| Biru tua | `#17365d` | Warna utama: tombol utama dashboard, judul, sidebar |
| Biru | `#285783` | Pendamping: gradasi header, tautan, fokus, grafik |
| Emas | `#c6a34a` | Aksen: tombol aksi utama halaman publik, penanda aktif, garis hiasan |
| Latar | `#f3f6fa` | Latar halaman (`--background`) |

Nilai pelengkap. Yang bertanda "prototipe" diambil dari prototipe HTML SAPA DESA yang sudah ada; yang bertanda [USULAN] dibuat oleh penyusun PRD:

| Nama | Hex | Asal | Peran |
|---|---|---|---|
| Teks | `#203047` | prototipe | teks utama (`--foreground`) |
| Permukaan | `#ffffff` | prototipe | kartu, dialog, kolom isian |
| Teks di atas emas | `#18283c` | prototipe | teks tombol emas |
| Garis | `#dce4ee` | prototipe | batas kartu dan tabel |
| Garis isian | `#cbd6e3` | prototipe | batas kolom isian |
| Redam | `#eaf0f6` | prototipe | latar tombol sekunder, header tabel |
| Teks redam | `#718096` | prototipe | teks pendukung, keterangan kecil |
| Bahaya | `#b74646` | prototipe | teks dan ikon error, tombol hapus |
| Latar bahaya | `#fae9e9` | prototipe | latar peringatan bahaya |
| Latar peringatan | `#fff8e7` | prototipe | latar kotak informasi |
| Teks peringatan | `#705b24` | prototipe | teks di atas latar peringatan |
| Biru muda | `#6b8fb5` | [USULAN] | warna grafik ke-4 |
| Abu | `#9aa8b8` | [USULAN] | warna grafik ke-5 |

Pemetaan ke variabel shadcn (konversikan ke format warna yang dipakai `tailwind.css` hasil generate; **nilai tetap dari config**):

| Variabel | Diisi dari |
|---|---|
| `--background` / `--foreground` | Latar / Teks |
| `--card`, `--popover` (+ `-foreground`) | Permukaan / Teks |
| `--primary` (+ foreground putih) | Biru tua |
| `--secondary`, `--muted` (+ foreground) | Redam / Biru tua dan Teks redam |
| `--accent` (+ `--accent-foreground`) | Emas / Teks di atas emas |
| `--destructive` | Bahaya |
| `--border` / `--input` | Garis / Garis isian |
| `--ring` | Biru |
| `--chart-1` … `--chart-5` | Biru tua, Biru, Emas, Biru muda, Abu |
| `--sidebar` (+ foreground putih, item aktif emas) | Biru tua |
| `--radius` | 0,75 rem (kartu); tombol dan isian 0,5 rem |

Kontras: emas **tidak boleh dipakai sebagai warna teks di atas latar terang**. Emas dipakai sebagai latar (dengan teks `#18283c`), garis, atau ikon. Putih di atas biru tua dan biru sudah lolos kontras.

Mode gelap: **[DITUNDA]**. Hanya mode terang pada versi pertama.

### 2.2 Warna status laporan [USULAN]

Disimpan di `shared/config/tema.ts` bersama label dan urutan status (nilai kunci harus sama dengan enum `status_laporan`).

| Status | Label | Latar | Teks |
|---|---|---|---|
| `diterima` | Diterima | `#eaf0f6` | `#17365d` |
| `diverifikasi` | Diverifikasi | `#fff8e7` | `#705b24` |
| `ditindaklanjuti` | Ditindaklanjuti | `#dbe6f2` | `#285783` |
| `selesai` | Selesai | `#e6f4ea` | `#1e6b3a` |
| `ditolak` | Ditolak | `#fae9e9` | `#b74646` |

Penjelasan ramah untuk masyarakat (ditampilkan di halaman lacak, juga di config):

| Status | Penjelasan |
|---|---|
| Diterima | Laporan Anda sudah masuk dan menunggu diperiksa petugas. |
| Diverifikasi | Petugas sudah memeriksa laporan Anda. |
| Ditindaklanjuti | Laporan Anda sedang ditangani. |
| Selesai | Penanganan laporan sudah selesai. |
| Ditolak | Laporan tidak dapat diproses. Lihat keterangan petugas. |

### 2.3 Gaya

- Gaya prototipe dipertahankan: header gradasi `#17365d → #285783` dengan garis bawah emas 4 px, kartu putih berbatas `#dce4ee` dengan sudut membulat, judul biru tua tebal.
- Huruf: **Plus Jakarta Sans** (variabel, di-host sendiri lewat `@fontsource-variable/plus-jakarta-sans`, tanpa request ke pihak ketiga), satu tempat di `tailwind.css` (`--font-sans`). Dipakai di seluruh aplikasi.
- Ikon: satu set (disarankan Lucide, bawaan shadcn). Jangan memakai emoji sebagai ikon antarmuka.
- Nama dan tagline dari config: `APP_NAME = "SAPA DESA"`, tagline "Sistem Aplikasi Pemantauan Aktivitas Desa Binaan Imigrasi" (dari prototipe), nama instansi "Kantor Wilayah Kemenimipas Riau". Logo: **belum ada** [USULAN: tempatkan berkas logo di satu path, config menunjuk ke path itu; sementara tampilkan teks `APP_NAME`].

### 2.4 Pembagian komponen UI

| Bagian | Pustaka |
|---|---|
| Halaman masyarakat dan landing: `/`, `/informasi`, `/lapor`, `/lacak` | **HyperUI** (snippet Tailwind, disalin menjadi komponen di `app/components/public`) |
| Login dan semua dashboard (admin, Kanwil, UPT) | **shadcn-vue** (di `app/components/ui`) |

Grafik memakai komponen chart bawaan shadcn-vue.

---

## 3. Peta halaman dan rute

### 3.1 Publik (tanpa login, tata letak `publik`)

| Rute | Halaman |
|---|---|
| `/` | Landing (tujuan QR) |
| `/informasi` | Informasi keimigrasian (FAQ) |
| `/lapor` | Form laporan |
| `/lacak` | Cek status laporan (`?kode=` opsional) |

### 3.2 Login dan umum

| Rute | Halaman | Akses |
|---|---|---|
| `/masuk` | Login petugas | belum login |
| `/akun/password` | Ganti password | semua peran login |
| `/403`, `/404` | Halaman galat | semua |

### 3.3 UPT (tata letak `dashboard`)

| Rute | Halaman |
|---|---|
| `/upt/pilih-petugas` | Bertugas atas nama siapa |
| `/upt` | Dashboard |
| `/upt/laporan` | Daftar laporan masyarakat |
| `/upt/laporan/[id]` | Detail dan ubah status |
| `/upt/kegiatan` | Daftar laporan kegiatan PIMPASA |
| `/upt/kegiatan/baru`, `/upt/kegiatan/[id]` | Form buat dan ubah |
| `/upt/pegawai` | Kelola pegawai kantor |
| `/upt/profil` | Profil kantor, wilayah, petugas PIMPASA |

### 3.4 Kanwil dan admin (tata letak `dashboard`)

| Rute | Halaman | Admin | Kanwil |
|---|---|---|---|
| `/kanwil` | Dashboard | ya | ya |
| `/kanwil/peringkat` | Peringkat | ya | ya |
| `/kanwil/pantauan` | Laporan belum ditanggapi | ya | ya |
| `/kanwil/laporan`, `/kanwil/laporan/[id]` | Laporan masyarakat (baca saja untuk Kanwil; admin dapat ubah status) | ya | ya |
| `/kanwil/kegiatan`, `/kanwil/kegiatan/[id]` | Laporan kegiatan PIMPASA (baca saja) | ya | ya |
| `/kanwil/upt/[kantorId]` | Lihat dashboard sebagai UPT | ya | ya |
| `/kanwil/desa-binaan` | Kelola desa binaan | ya | ya |
| `/kanwil/penugasan` | Penugasan PIMPASA | ya | ya |
| `/kanwil/wilayah-kerja` | Wilayah kerja UPT | ya | ya |
| `/kanwil/faq` | Kelola FAQ | ya | ya |
| `/kanwil/pengaturan` | Pengaturan dan jenis kegiatan | ya | ya |
| `/admin/status` | Status sistem dan saklar lokasi | ya | tidak |
| `/admin/akun` | Kelola akun | ya | tidak |
| `/admin/log` | Log aktivitas | ya | tidak |

Admin dan Kanwil memakai tata letak yang sama; admin punya kelompok menu tambahan "Admin". `/admin/akun` dan `/admin/log` dikerjakan di tahap akhir (bagian 10).

### 3.5 Penjaga rute (middleware)

- Belum login membuka rute petugas → arahkan ke `/masuk?redirect=<rute asal>`.
- Peran tidak sesuai (mis. UPT membuka `/kanwil`) → arahkan ke beranda perannya dengan toast "Anda tidak memiliki akses ke halaman itu." (halaman `/403` untuk akses langsung).
- Akun UPT yang belum memilih petugas → arahkan ke `/upt/pilih-petugas`. Pengecualian: `/akun/password`, dan `/upt/pegawai` saat daftar pegawai aktif masih kosong.
- Profil `aktif = false` → akhiri sesi, kembali ke `/masuk` dengan pesan "Akun Anda dinonaktifkan. Hubungi admin."
- Sesi habis di tengah kerja → toast "Sesi berakhir, silakan masuk lagi", arahkan ke `/masuk?redirect=...`. Data form yang belum tersimpan tidak hilang tanpa peringatan (konfirmasi sebelum meninggalkan halaman bila form berubah).

---

## 4. Halaman masyarakat

Prinsip: **mobile-first** (lebar dasar 360 px), tombol dan target sentuh minimal 44 px, teks isi minimal 16 px (mencegah zoom otomatis di iOS), tanpa jargon. Bahasa Indonesia baku yang ramah.

### 4.1 Layout publik

- **Header** (melekat di atas, latar blur): logo SAPA DESA dan nama sistem (di HP cukup "SAPA DESA"), menu tengah **Beranda · Informasi · Cek Aduan**, dan tombol emas **Aduan Masyarakat** di kanan (di HP dipendekkan menjadi "Aduan"). Di HP menu menjadi hamburger berisi semua tautan ditambah **PIMPASA · Masuk petugas**.
- **Footer** (biru tua, garis aksen emas): logo + deskripsi layanan + logo instansi; kolom **Jelajahi** (tautan menu + tombol PIMPASA untuk petugas); kolom **Hubungi kami** (alamat, telepon, email, Instagram, TikTok dari `KONTAK_INSTANSI` di `shared/config/app.ts`). Di `/informasi` footer diawali blok ajakan "Lihat sesuatu yang mencurigakan?" dengan tombol Aduan Masyarakat dan Cek Aduan.
- Tag meta untuk berbagi di media sosial (judul, deskripsi singkat, gambar) di `/`, karena pimpinan bisa menyebarkan tautan lewat media sosial.
- Rute petugas (`/upt/*`, `/kanwil/*`, `/admin/*`, `/masuk`, `/akun/*`) diberi `noindex`.
- **Istilah**: menu dan tombol memakai "**Aduan Masyarakat**" (halaman `/lapor`) dan "**Cek Aduan**" (halaman `/lacak`). Seluruh teks yang dilihat masyarakat (form, dialog berhasil, hasil lacak, pesan galat, FAQ) juga memakai kata "aduan", bukan "laporan". Istilah "laporan" tetap dipakai di sisi petugas (dashboard UPT, Kanwil, admin) dan pada nama rute, tabel, dan enum database.

### 4.2 Landing `/`

Tujuan: pengunjung yang mencari SAPA DESA lewat mesin pencari (tanpa QR) memahami program PIMPASA dan dapat menyampaikan atau mengecek aduan. **QR di titik desa mengarah langsung ke `/lapor` (Aduan Masyarakat), bukan ke landing.** Petugas masuk lewat tombol **PIMPASA**.

| Bagian | Isi |
|---|---|
| Hero PIMPASA | Latar terang. Kiri: label "Program Desa Binaan Imigrasi", judul **PIMPASA** + "Petugas Imigrasi Pembina Desa", paragraf pengantar, **satu tombol "PIMPASA"** (biru tua) menuju `/masuk` dengan catatan "Khusus petugas". Kanan: foto petugas PIMPASA (**cutout transparan**) di depan lingkaran biru muda, dengan kartu melayang: jumlah desa binaan, jumlah kantor imigrasi dan kabupaten/kota, serta daftar kegiatan PIMPASA |
| Logo instansi | Pita putih di bawah hero: nama kantor wilayah dan logo dari `LOGO_INSTANSI` |
| Aduan Masyarakat | Foto kiri (kartu melayang contoh kode aduan), kanan: judul "Lihat sesuatu yang mencurigakan di desa Anda?", pengantar, tiga poin centang, dua tombol: **Aduan Masyarakat** (emas, ikon, ke `/lapor`) dan **Cek Aduan** (biru tua, ikon, ke `/lacak`) |
| Alur dan tata cara aduan | 3 kartu bernomor dengan ikon: isi aduan di HP, petugas setempat menindaklanjuti, pantau dengan kode aduan |
| Informasi keimigrasian | Pintasan 5 pertanyaan FAQ pertama dan tombol "Lihat semua informasi" ke `/informasi` |

- **Angka kartu hero** (`desaBinaan`, `kantor`, `kabupaten`) diambil dari `GET /api/publik/statistik`, yang hanya menghitung baris di tabel yang boleh dibaca `anon` (`desa_kelurahan` dengan `dbi = true`, `kantor_imigrasi` aktif, `kabupaten`). Hasil di-cache server 1 jam. Bila gagal dimuat, kartu angka disembunyikan (tidak menampilkan angka palsu).
- **Foto**: taruh `pimpasa-petugas.png` dan `aduan-masyarakat.png` (PNG/WebP, latar transparan untuk hero) di `public/images/landing/`. Nama dan ukuran ada di `FOTO_LANDING`. Selama berkas belum ada, tampil ilustrasi pengganti berukuran sama.
- Keadaan: bila FAQ kosong setelah dimuat, bagian "Informasi keimigrasian" **disembunyikan**. Saat memuat tampil skeleton; bila gagal, pesan dan tombol "Coba lagi".
- Animasi kartu melayang dimatikan saat pengguna memilih `prefers-reduced-motion`.

### 4.3 Informasi keimigrasian `/informasi`

Tata letak mengikuti referensi desain FAQ yang diberikan pemilik project, dengan warna palet SAPA DESA:

- **Desktop**: dua kolom. Kiri: label kecil "FAQ", judul besar "Pertanyaan yang Sering Diajukan", dan kartu ajakan: "Ingin melapor? Laporkan langsung dan pantau dengan kode laporan" dengan tombol **Buat Laporan** (emas). Kanan: daftar akordeon.
- **HP**: satu kolom; judul, daftar akordeon, lalu kartu ajakan di bawah.
- **Akordeon** (HyperUI): setiap butir berupa kartu putih bersudut membulat dengan pertanyaan dan ikon `+` (tertutup) atau `×` (terbuka). **Satu butir terbuka dalam satu waktu.** Butir pertama terbuka saat halaman dimuat. Dapat dioperasikan dengan keyboard (Enter dan Spasi, atribut `aria-expanded`).
- Jika FAQ lebih dari 8 butir, tampilkan kolom cari di atas daftar (penyaringan di sisi klien pada pertanyaan dan jawaban).
- Data: `from('faq')` urut `urutan` (KONTRAK_API bagian 1).
- **Jawaban ditampilkan sebagai teks biasa dengan baris baru dipertahankan.** Jangan merender sebagai HTML (`v-html`): isinya diketik admin dan Kanwil, jadi harus di-escape.
- Kosong: "Informasi belum tersedia. Anda tetap dapat membuat laporan." dengan tombol Buat Laporan.
- Error muat: "Informasi gagal dimuat." dengan tombol "Coba lagi".

### 4.4 Form laporan `/lapor`

Inti produk. Aturan keras: **form tidak bisa diisi dan dikirim sebelum lokasi perangkat aktif.**

#### Tahap lokasi

Saat halaman dimuat, cek dukungan `navigator.geolocation` dan koneksi aman (HTTPS), lalu masuk ke salah satu keadaan. **Pesan ditangani seluruhnya di frontend.**

| Keadaan | Tampilan |
|---|---|
| Menunggu | Kartu di atas form: "Aktifkan lokasi untuk melanjutkan. Laporan hanya dapat dikirim dari wilayah Provinsi Riau." Tombol **Izinkan Lokasi**. Seluruh isian dan tombol kirim **nonaktif** (tampilan redup) |
| Meminta | Tombol berputar "Mendeteksi lokasi…". Isian tetap nonaktif |
| Berhasil | Kartu berubah menjadi penanda hijau kecil "Lokasi terdeteksi" (tanpa menampilkan koordinat atau akurasi). Isian aktif. Koordinat dan akurasi disimpan di memori untuk dikirim |
| Izin ditolak | "Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini di pengaturan browser, lalu coba lagi." Tombol **Coba lagi**. Isian tetap nonaktif |
| GPS mati (`POSITION_UNAVAILABLE`) | "Lokasi perangkat tidak tersedia. Nyalakan GPS atau layanan lokasi di HP Anda, lalu coba lagi." Tombol **Coba lagi** |
| Waktu habis (`TIMEOUT`) | "Lokasi belum berhasil dideteksi. Pastikan sinyal dan GPS aktif, lalu coba lagi." Tombol **Coba lagi** |
| Tidak didukung atau bukan HTTPS | "Browser atau koneksi Anda tidak mendukung deteksi lokasi. Buka tautan ini lewat browser terbaru." Isian tetap nonaktif |

Catatan:
- Jika izin sudah pernah diberikan (Permissions API), langsung mendeteksi tanpa menunggu tombol.
- Pakai akurasi tinggi (`enableHighAccuracy`) dengan batas waktu wajar (mis. 15 detik, di config).
- **Jangan menampilkan peringatan akurasi GPS** kepada masyarakat. Nilai `akurasi_meter` tetap dikirim.
- Koordinat tidak diedit pengguna dan tidak ditampilkan sebagai kolom isian.

#### Kolom isian

Urutan dan label (label boleh disempurnakan, tetapi isi dan urutan tetap):

| # | Label | Jenis | Aturan |
|---|---|---|---|
| 1 | Nama lengkap | teks | wajib, 1–150 karakter |
| 2 | Kabupaten/Kota | dropdown | wajib; hanya Riau (data dari database) |
| 3 | Kecamatan | dropdown | wajib; nonaktif sampai kabupaten dipilih; isi mengikuti kabupaten |
| 4 | Desa/Kelurahan | dropdown | wajib; nonaktif sampai kecamatan dipilih; isi mengikuti kecamatan. Bila ada nama ganda dalam satu kecamatan (kelurahan dan desa), beri akhiran "(Kelurahan)" atau "(Desa)" pada keduanya |
| — | Kantor yang melayani | teks tampilan | muncul setelah kabupaten dipilih: "Laporan Anda akan dilayani oleh:" diikuti nama kantor dari database, ditampilkan **huruf kapital** (mis. KANTOR IMIGRASI KELAS I TPI PEKANBARU). Bukan isian |
| 5 | Alamat Anda | area teks 2–3 baris | wajib, 1–500 karakter |
| 6 | Siapa yang Anda laporkan? | dropdown | wajib; "Warga Negara Asing (WNA)" atau "Warga Negara Indonesia (WNI)" |
| 7 | Apa yang ingin Anda laporkan? | area teks | wajib, 10–5000 karakter; tinggi awal ±8 baris, dapat digulir ke atas dan bawah; penghitung karakter "0/5000" |
| 8 | Foto pendukung (opsional) | unggah file | maksimal **1** foto, JPEG/PNG/WebP, ≤ 3 MB |
| 9 | Ini tindak lanjut laporan sebelumnya? (opsional) | bagian lipat | berisi satu kolom "Kode laporan sebelumnya" berpola `SD-XXXX-XXXX` |

Foto: di HP, tombol "Pilih foto atau ambil dengan kamera" (`accept="image/*"`). Foto yang lebih besar dari batas **dikompres otomatis di browser** (perkecil sisi terpanjang sekitar 1600 px, kualitas bertahap) sebelum diunggah; jika tetap melebihi 3 MB, tolak dengan pesan jelas. Tampilkan pratinjau kecil dengan tombol "Hapus foto".

#### Pengiriman

- Tombol **Kirim Laporan** aktif hanya jika lokasi terdeteksi dan semua isian wajib valid. Pesan validasi tampil di bawah kolom yang bersangkutan, dalam Bahasa Indonesia.
- Saat dikirim: tombol menampilkan "Mengirim…" dan **dikunci** (cegah kirim ganda). Seluruh isian nonaktif sampai ada hasil.
- Alur pemanggilan mengikuti KONTRAK_API bagian 2 (lewat endpoint server, bukan langsung dari browser).
- **Pemetaan galat**:

| Penyebab | Pesan |
|---|---|
| Lokasi di luar Riau (`22023`) | "Lokasi Anda terdeteksi di luar Provinsi Riau. Laporan hanya dapat dikirim dari wilayah Riau." |
| Terlalu banyak percobaan (429) | "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." |
| Kode laporan sebelumnya tidak ditemukan | "Kode laporan sebelumnya tidak ditemukan. Periksa penulisannya atau kosongkan kolom itu." |
| Foto ditolak (tipe/ukuran) | "Foto harus berformat JPEG, PNG, atau WebP dan berukuran maksimal 3 MB." |
| Desa/kelurahan tidak valid (pesan database `Desa/kelurahan tidak valid`) | "Desa atau kelurahan yang dipilih tidak valid. Pilih ulang dari daftar." Isian **tidak dikosongkan** |
| Jaringan putus atau galat lain | "Laporan belum terkirim. Periksa koneksi Anda lalu coba lagi." Isian **tidak dikosongkan** |

#### Dialog berhasil

Setelah berhasil, tampilkan dialog (HyperUI) yang tidak tertutup oleh klik di luar dialog:

1. Judul "Laporan berhasil dikirim".
2. **Kode laporan** besar, huruf lebar tetap, dengan tombol **Salin kode** (umpan balik "Tersalin").
3. Petunjuk: "Simpan kode ini. Anda memerlukannya untuk memantau laporan."
4. **Timeline** (komponen HyperUI, lihat 4.6) yang berisi satu butir: Diterima, dengan waktu di sisi kiri.
5. Tombol **Cek status** (menuju `/lacak?kode=…`) dan **Tutup**.
6. Jika Tutup ditekan sebelum kode pernah disalin: konfirmasi "Pastikan kode sudah Anda simpan. Kode tidak dapat ditampilkan lagi." Setelah ditutup, form dikosongkan.

### 4.5 Cek status `/lacak`

- Satu kolom isian "Kode laporan" dengan contoh `SD-7KQ2-M9XP`. Otomatis huruf besar, spasi dibuang, tanda hubung disisipkan otomatis. Tombol **Cek Status**.
- Jika dibuka dengan `?kode=`, langsung mencari.
- **Hasil**: kartu berisi kode, nama kantor yang menangani, waktu laporan dikirim, status saat ini (lencana warna + penjelasan ramah dari 2.2), dan **timeline** (4.6). Tombol "Muat ulang".
- Tidak ditemukan: "Kode tidak ditemukan. Periksa kembali penulisan kode Anda." (satu pesan umum, tidak membedakan penyebab).
- Terlalu banyak percobaan: pesan yang sama dengan 429 di atas.
- **Tidak pernah menampilkan** nama, alamat, isi laporan, atau nama petugas (hasil fungsi `lacak_laporan` memang tidak memuatnya; jangan menambahkannya).

### 4.6 Komponen timeline (dipakai di dialog dan `/lacak`)

Komponen `TimelineStatus` (HyperUI timeline), satu komponen untuk dua tempat. Setiap butir:

- **Sisi kiri garis**: tanggal dan jam, zona WIB, format `16 Nov 2026, 14.30 WIB`.
- **Sisi kanan garis**: lencana status (warna 2.2) dan, **bila ada**, keterangan tambahan sebagai paragraf di bawahnya. Keterangan tampil apa adanya sebagai teks biasa (di-escape).
- Urut dari yang terlama ke terbaru; butir terakhir diberi penekanan (penanda lebih besar).
- Di layar sempit, waktu pindah ke atas lencana (satu kolom).

---

## 5. Login dan sesi petugas

### 5.1 Login `/masuk` (shadcn)

- Kartu di tengah layar, dengan `APP_NAME` dan nama instansi di atasnya.
- Kolom **Username** (huruf kecil otomatis) dan **Password** (dengan tombol tampil/sembunyi). Tombol **Masuk**.
- Email dibentuk dari username dan domain di config (KONTRAK_API bagian 3a). Pengguna **tidak** mengetik domain.
- Teks kecil: "Lupa password? Hubungi admin." Tidak ada tautan reset mandiri.
- Galat: "Username atau password salah." (satu pesan, tidak membedakan penyebab). Akun nonaktif: "Akun Anda dinonaktifkan. Hubungi admin." Terlalu banyak percobaan: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi."
- Setelah berhasil: UPT → `/upt/pilih-petugas`; Kanwil dan admin → `/kanwil`. Jika ada parameter `redirect` dan sesuai peran, ikuti.

### 5.2 Pilih petugas `/upt/pilih-petugas`

- Kartu "Bertugas atas nama siapa?" dengan penjelasan satu kalimat: "Nama Anda akan dicatat pada setiap perubahan yang dilakukan."
- Daftar pegawai aktif kantor (nama, urut abjad) sebagai kotak pilihan yang dapat dicari. Tombol **Lanjut** aktif setelah memilih.
- Pilihan disimpan di sesi dan dipakai untuk: `p_pegawai_id` saat mengubah status, nilai awal petugas pada form kegiatan, dan header `x-bertugas-id` pada semua request (KONTRAK_API bagian 3a).
- Daftar kosong: "Belum ada pegawai terdaftar di kantor Anda." dengan tombol **Tambah pegawai** (menuju `/upt/pegawai`).
- Pilihan berlaku sampai keluar. Header dashboard selalu menampilkan petugas aktif dengan tautan **Ganti petugas**.

---

## 6. Kerangka dashboard (UPT, Kanwil, admin)

Tampilan desktop-first (shadcn), tetap dapat dipakai di tablet.

- **Sidebar** biru tua (kolaps menjadi ikon; di HP menjadi panel geser). Nama aplikasi di atas, menu sesuai peran, item aktif diberi penanda emas.
- **Bilah atas**: judul halaman, remah roti (breadcrumb), dan menu pengguna: nama tampil, lencana peran, nama kantor (UPT), **Ganti password**, **Keluar**. Untuk UPT: lencana "Bertugas: {nama}" dengan tautan Ganti petugas.
- **Area banner global** di bawah bilah atas:
  - **Saklar lokasi mati** (khusus tampilan admin): banner merah "Validasi lokasi dimatikan. Laporan dari luar Riau dapat masuk. Hidupkan kembali setelah pengujian." Data dari `dashboard_admin_status` (KONTRAK_API 5.1).
  - **Mode uji coba**: bila `NUXT_PUBLIC_APP_MODE = test`, banner kuning "MODE UJI COBA". Env ini hanya memunculkan banner, tidak mengubah hak akses.
  - **Impersonasi** (tahap akhir): banner "Anda masuk sebagai {akun}" dengan tombol Keluar.
- Konten halaman dalam kartu dengan jarak konsisten; judul halaman biru tua.

### Menu per peran

| UPT | Kanwil | Admin (tambahan) |
|---|---|---|
| Dashboard | Dashboard | Status sistem |
| Laporan Masyarakat | Peringkat | Akun *(tahap akhir)* |
| Laporan Kegiatan | Pantauan | Log aktivitas *(tahap akhir)* |
| Pegawai | Laporan Masyarakat | |
| Profil Kantor | Laporan Kegiatan | |
| | Desa Binaan | |
| | Penugasan PIMPASA | |
| | Wilayah Kerja | |
| | FAQ | |
| | Pengaturan | |

Admin melihat semua menu Kanwil ditambah kelompok Admin. Pada setiap halaman Kanwil/admin tersedia pemilih "Lihat sebagai UPT" (dropdown 7 kantor) yang membuka `/kanwil/upt/[kantorId]` (dashboard UPT untuk kantor itu, hanya baca).

---

## 7. Halaman UPT

### 7.1 Dashboard `/upt`

Pertanyaan yang harus terjawab dalam sekali lihat: **apa yang harus saya tindak, apa yang hampir telat, desa mana yang belum saya datangi.** Urutan dari atas ke bawah:

**a. Lima kartu angka** (`dashboard_upt_ringkasan`). Setiap kartu bisa diklik.

| Kartu | Tujuan klik | Aturan tampilan |
|---|---|---|
| Perlu ditanggapi | `/upt/laporan` filter status Diterima | — |
| Sedang ditangani | `/upt/laporan` filter Diverifikasi dan Ditindaklanjuti | — |
| Terlambat | `/upt/laporan` filter Terlambat | **Merah bila > 0**, dengan keterangan "lebih dari {batas_hari} hari kerja" |
| Selesai atau ditolak bulan ini | `/upt/laporan` filter Selesai dan Ditolak | — |
| Kegiatan PIMPASA bulan ini | `/upt/kegiatan` | — |

**b. Perlu tindakan** (`dashboard_upt_perlu_tindakan`, 10 baris): tabel laporan `diterima` terlama dulu.

| Kolom | Isi |
|---|---|
| Kode | `SD-XXXX-XXXX` |
| Lokasi | Desa, Kecamatan |
| Jenis | lencana WNA/WNI |
| Masuk | tanggal (waktu relatif "3 hari lalu" dengan tooltip tanggal lengkap) |
| Batas | `sisa_hari_kerja` ≥ 0 → "Sisa {n} hari kerja"; < 0 → **"Terlambat {n} hari kerja"** (merah) |
| Aksi | tombol **Tinjau** → `/upt/laporan/[id]` |

Tautan "Lihat semua" ke `/upt/laporan`. Kosong: "Tidak ada laporan yang perlu ditanggapi." **Tidak** menampilkan nama atau alamat pelapor.

**c. Desa binaan** (`dashboard_upt_desa_binaan`): tabel desa binaan di wilayah kantor. Kolom: Desa, Kecamatan, PIMPASA (nama sebagai lencana kecil; **jangan memecah** kolom `petugas` dari fungsi, karena berupa satu teks gabungan yang bisa kosong dan nama bergelar bisa memuat koma. Ambil daftar tepatnya dari `desa_binaan_pegawai` digabung `pegawai` dengan `tanggal_selesai is null`, UPT berhak membacanya. Kosong: "Belum ada petugas"), Kegiatan terakhir (tanggal, atau **"Belum pernah"**), Hari sejak kegiatan, Kegiatan bulan ini, dan tombol **Buat laporan** (membuka `/upt/kegiatan/baru?desa=…` dengan desa terisi). Baris "Belum pernah" paling atas dan diberi latar peringatan. Baris yang sudah lebih dari `AMBANG_DESA_LAMA_HARI` hari tanpa kegiatan diberi lencana kuning **[USULAN: 30 hari, di config]**. Nilai `kegiatan_terakhir` bisa `null`, tangani itu.

**d. Tren** (`dashboard_upt_tren`), dengan pemilih periode (Bulan ini, 6 bulan terakhir, Kustom). **Perilaku periode:** grafik batang "laporan per bulan" selalu memuat 6 bulan yang berakhir di bulan akhir periode (ditentukan fungsi, jangan difilter ulang di UI). Pemilih periode memengaruhi donat WNA/WNI, kegiatan per jenis, dan tabel kandidat DBI:
- Grafik batang bertumpuk: laporan masuk per bulan, WNA dan WNI.
- Grafik donat: proporsi WNA dan WNI.
- Grafik batang mendatar: kegiatan per jenis kegiatan (semua jenis aktif, termasuk 0).
- Tabel kecil **"Desa non-DBI yang paling sering dilaporkan"** (`kandidat_dbi`, 10 baris) dengan catatan: "Dapat diusulkan ke Kanwil sebagai Desa Binaan Imigrasi baru." Tidak ada tombol usul (alurnya berjalan di luar aplikasi).

**Tidak ada** peringkat atau perbandingan dengan UPT lain di mana pun di halaman UPT.

### 7.2 Daftar laporan masyarakat `/upt/laporan`

- **Tab cepat**: Perlu ditanggapi · Sedang ditangani · Selesai dan Ditolak · Semua. Menerima parameter URL dari kartu dashboard.
- **Filter**: status (pilih beberapa), jenis terlapor, rentang tanggal masuk, pencarian (kode, desa, atau kecamatan), tombol **Terlambat saja**.
- **Tabel**: Kode · Masuk · Desa · Kecamatan · Jenis · Status (lencana) · Batas (hanya status Diterima: sisa atau terlambat). **Tanpa nama dan alamat pelapor.** Urut terbaru dulu, bisa diubah. Halaman per 20 baris (paginasi sisi server). Klik baris → detail.
- Kosong: "Belum ada laporan." (atau "Tidak ada laporan yang cocok dengan filter." dengan tombol Reset filter).
- Di HP/tablet sempit, tabel menjadi daftar kartu.

### 7.3 Detail laporan `/upt/laporan/[id]`

Dua kolom di desktop (konten kiri, timeline dan aksi kanan); satu kolom di layar sempit.

**Kolom kiri: isi laporan**
- Kepala: kode (dengan tombol salin), lencana status, tanggal masuk.
- **Pelapor**: nama dan alamat (**hanya muncul di halaman ini**).
- **Lokasi kejadian**: Desa, Kecamatan, Kabupaten/Kota.
- **Yang dilaporkan**: lencana WNA/WNI.
- **Isi laporan**: teks penuh, baris baru dipertahankan, di-escape.
- **Foto** (bila ada): gambar kecil yang bisa diklik untuk memperbesar; diambil lewat signed URL yang dibuat server (KONTRAK_API 4.1). Tidak ada foto: bagian disembunyikan.
- **Lokasi pelapor**: koordinat dengan tautan "Buka di peta" (membuka peta di tab baru dari `lintang`, `bujur`). Peta tertanam **[DITUNDA]**.
- **Laporan lanjutan**: bila `laporan_sebelumnya_id` terisi dan laporannya dapat dibaca, tampilkan tautan ke laporan itu; bila tidak dapat dibaca, tampilkan hanya kode.

**Kolom kanan: timeline dan ubah status**
- **Timeline internal**: komponen yang sama dengan 4.6, ditambah baris "oleh {nama petugas}" di setiap butir (petugas hanya tampil di sisi internal ini, **tidak pernah** di halaman masyarakat).
- **Panel Ubah status** (untuk UPT; admin memakainya di halaman 8.4; Kanwil hanya membaca):
  - Pilihan status hanya yang **sah menurut alur** (KONTRAK_API 4.2): Diterima → Diverifikasi atau Ditolak; Diverifikasi → Ditindaklanjuti atau Ditolak; Ditindaklanjuti → Selesai. Status final (Selesai, Ditolak): panel diganti teks "Laporan sudah final dan tidak dapat diubah."
  - Kolom **Keterangan**, dengan label "Keterangan (dapat dilihat oleh pelapor)" dan penghitung 0/1000. **Wajib** untuk Ditolak dan Selesai, opsional untuk lainnya. Teks bantu: "Jangan menuliskan identitas orang asing atau data sensitif."
  - Baris tetap "Bertugas atas nama: {nama}" (dari 5.2) dengan tautan Ganti petugas.
  - Tombol **Simpan status**. Untuk Ditolak dan Selesai tampil dialog konfirmasi: "Status ini final dan tidak dapat diubah lagi. Lanjutkan?"
  - Setelah berhasil: toast "Status diperbarui", timeline dimuat ulang, panel menyesuaikan status baru.
  - Pemetaan galat: "Laporan tidak ditemukan" (laporan sudah dihapus atau bukan milik kantor), "Keterangan wajib diisi untuk status ini", loncatan status tidak sah (muat ulang halaman dan tampilkan status terbaru).

### 7.4 Daftar laporan kegiatan `/upt/kegiatan`

- Filter: bulan atau rentang tanggal (default bulan ini), desa, jenis kegiatan, petugas.
- Tabel: Tanggal · Desa · Jenis · Peserta · Petugas (dengan lencana **"Digantikan"** bila `petugas_pengganti`) · Lampiran (ikon foto dan PDF bila ada) · Aksi.
- **Aksi**: Lihat/Ubah, dan **Hapus** yang hanya tampil selama jendela hapus (`batas_menit_hapus_laporan`, default 10 menit dari `created_at`), dengan keterangan hitung mundur "Dapat dihapus {n} menit lagi". Setelah jendela habis tombol Hapus **hilang**; koreksi lewat Ubah.
- Hapus: dialog konfirmasi "Hapus laporan ini? Tindakan ini tidak dapat dibatalkan." Setelah baris terhapus, server menghapus file di Storage (KONTRAK_API 4.4). Hasil 0 baris terhapus → "Laporan tidak dapat dihapus karena batas waktu hapus sudah lewat."
- Tombol **Buat Laporan Kegiatan** di atas tabel.
- Kosong: "Belum ada laporan kegiatan bulan ini." dengan tombol Buat.

### 7.5 Form laporan kegiatan `/upt/kegiatan/baru` dan `/upt/kegiatan/[id]`

| # | Label | Jenis | Aturan |
|---|---|---|---|
| 1 | Tanggal kegiatan | tanggal | wajib; awal = hari ini (WIB); tidak boleh melewati hari ini |
| 2 | Kantor | teks tampilan | nama kantor dari akun; bukan isian |
| 3 | Desa binaan | dropdown | wajib; hanya desa binaan di wilayah kantor (`dashboard_upt_desa_binaan`); menampilkan nama desa dan kecamatan. Terisi otomatis bila datang dari `?desa=` |
| 4 | Petugas | dropdown | wajib; pegawai aktif kantor; awal = petugas aktif (5.2). **Pratinjau lencana "Digantikan"** muncul bila pegawai terpilih bukan PIMPASA berlaku di desa itu; ini hanya informasi, **tidak dikirim** (nilainya dihitung database) |
| 5 | Jenis kegiatan | dropdown | wajib; hanya jenis aktif |
| 6 | Jumlah peserta | angka | wajib; bilangan bulat 0–100000 |
| 7 | Uraian, hasil, dan tindak lanjut | area teks | wajib; 10–5000 karakter; penghitung |
| 8 | Foto dokumentasi (opsional) | unggah | maksimal 1; JPEG/PNG/WebP; ≤ 3 MB; kompres otomatis seperti 4.4 |
| 9 | Laporan PDF (opsional) | unggah | maksimal 1 berkas; PDF; ≤ **8 MB** |

Alur simpan:
1. Unggah file (bila ada) lebih dulu dengan sesi pengguna ke `{kantor_id}/{uuid}.{ext}` (nama unik), dengan bilah kemajuan per berkas.
2. Setelah semua berhasil, simpan baris laporan (jangan kirim `kantor_id`, `dibuat_oleh`, `petugas_pengganti`).
3. Jika langkah 2 gagal, minta server menghapus file yang sudah terunggah. Tombol dikunci selama proses (cegah kirim ganda).
4. Berhasil: kembali ke `/upt/kegiatan` dengan toast "Laporan kegiatan tersimpan."

Mode ubah: semua isian dapat diubah **kecuali desa**. Mengganti file = mengunggah file baru; berkas lama dihapus server setelah simpan berhasil. Pesan penolakan Storage (tipe atau ukuran) ditampilkan di bawah kolom unggah.

### 7.6 Pegawai `/upt/pegawai`

- Tabel pegawai kantor: Nama · NIP · Status (Aktif/Nonaktif) · Bertugas di (desa binaan berlaku sebagai lencana) · Aksi.
- **Tambah pegawai** (dialog): Nama (wajib, unik di kantor), NIP (opsional). Nama ganda → "Nama pegawai sudah terdaftar di kantor Anda."
- **Ubah** (dialog): nama dan NIP.
- **Nonaktifkan/Aktifkan**: saklar. Bila pegawai masih punya penugasan berlaku, penonaktifan ditolak dengan pesan "Tidak dapat dinonaktifkan: masih bertugas sebagai PIMPASA di {desa}. Minta Kanwil mengakhiri penugasannya terlebih dahulu." Pesan dari database tidak memuat nama desa; UI mengambilnya dari penugasan aktif pegawai itu (UPT berhak membacanya).
- **Tidak ada tombol hapus.**
- Pencarian nama.

### 7.7 Profil kantor `/upt/profil`

Tiga kartu (KONTRAK_API 4.7):
1. **Kantor**: nama lengkap, nama singkat, username akun.
2. **Wilayah kerja**: daftar kabupaten/kota sebagai lencana.
3. **Petugas PIMPASA**: tabel Pegawai · Desa binaan · Kecamatan · Kabupaten/Kota · Bertugas sejak. Kosong: "Belum ada petugas PIMPASA yang ditetapkan."

Tombol **Ganti password** menuju `/akun/password`.

---

## 8. Halaman Kanwil dan admin

Aturan umum: Kanwil **tidak mengubah status laporan** dan tidak membuat atau mengubah laporan kegiatan; halaman laporan baca saja untuk Kanwil. **Admin** memakai halaman yang sama dan, mengikuti hak di database, **dapat mengubah status laporan** (8.4). Laporan kegiatan tetap baca saja untuk admin di UI (belum ada halaman kelola kegiatan oleh admin).

### 8.1 Dashboard `/kanwil`

Di atas: **pemilih periode** yang berlaku untuk semua bagian halaman: Bulan ini (awal), Bulan lalu, Tahun ini, Kustom (pilih bulan atau rentang bebas).

**a. Kartu ringkasan** (`dashboard_kanwil_ringkasan`): Laporan masuk · Belum ditanggapi · **Terlambat** (merah bila > 0) · Sedang ditangani · Selesai · Ditolak · Kegiatan PIMPASA · Desa tanpa kegiatan (dari total desa binaan) · PIMPASA aktif.

**b. Tabel per UPT** (`dashboard_kanwil_per_upt`): satu baris per UPT. Kolom: UPT · Laporan masuk · Belum ditanggapi · Terlambat · Sedang ditangani · Direspon · Kegiatan · Desa binaan · Desa tanpa kegiatan. Kolom dapat diurutkan. Sel **Terlambat > 0** diberi warna merah. Klik baris → `/kanwil/upt/[kantorId]`.

**c. Tren** (`dashboard_kanwil_tren`): laporan per bulan (WNA/WNI bertumpuk), kegiatan per bulan, proporsi WNA/WNI, kegiatan per jenis. Perilaku periode sama seperti 7.1d: dua grafik per bulan selalu 6 bulan yang berakhir di akhir periode; pemilih periode memengaruhi proporsi dan kegiatan per jenis.

**d. Pantauan ringkas**: 5 laporan terlambat teratas dengan tautan "Lihat semua" ke `/kanwil/pantauan`.

Menjawab tujuan Kanwil: UPT yang aktif membuat laporan kegiatan, UPT yang aktif merespons laporan, dan kecamatan yang sering melapor (rincian di Peringkat).

### 8.2 Peringkat `/kanwil/peringkat`

Tiga tab, dengan pemilih periode yang sama (default **bulan berjalan**; pilihan bulanan, tahunan, atau rentang bebas).

| Tab | Isi | Sumber |
|---|---|---|
| **UPT** | Dua peringkat berdampingan: *Laporan kegiatan* (`peringkat_kegiatan`) dan *Respons laporan* (`peringkat_respons`) | `peringkat_upt` |
| **Kecamatan** | Kecamatan yang paling sering dilaporkan masyarakat | `peringkat_kecamatan` |
| **Desa** | Desa dengan laporan terbanyak; kolom lencana "DBI"; saklar **Hanya non-DBI (kandidat DBI)** | `peringkat_desa` |

- Peringkat 1–3 diberi penanda emas. Nilai sama berarti peringkat sama.
- Ikon info "Cara menghitung" pada tab UPT: "Direspon = laporan yang pertama kali keluar dari status Diterima pada periode ini, termasuk yang ditolak."
- Semua UPT tampil di tab UPT, termasuk yang bernilai 0. Tab Kecamatan dan Desa hanya memuat yang memiliki laporan.
- Opsional **[tidak wajib versi pertama]**: tombol "Unduh CSV" di sisi klien.

### 8.3 Pantauan `/kanwil/pantauan`

Tabel dari `v_laporan_belum_ditanggapi`: Kode · UPT · Kabupaten/Kota · Kecamatan · Desa · Jenis · Masuk · Hari kerja berjalan · Batas. Lencana "Terlambat {n} hari kerja" (merah), urut paling lama dulu; filter UPT. Teks di atas tabel: "Laporan berstatus Diterima yang belum ditanggapi lebih dari {batas_hari} hari kerja (tidak termasuk Sabtu, Minggu, dan hari libur)." Klik baris → detail laporan (baca saja untuk Kanwil; admin dapat ubah status, lihat 8.4). Teguran kepada atasan UPT dilakukan Kanwil secara manual di luar aplikasi.

Opsional **[tidak wajib versi pertama]**: tombol "Salin ringkasan" yang menyalin teks jumlah laporan terlambat per UPT.

### 8.4 Laporan masyarakat `/kanwil/laporan` dan detail

Sama dengan 7.2 dan 7.3 dengan perbedaan:
- Mencakup semua UPT; ada kolom dan filter **UPT**.
- **Panel Ubah status** tampil hanya untuk **admin**, dengan aturan yang sama seperti 7.3 (pilihan status sesuai alur, keterangan wajib untuk Ditolak dan Selesai, konfirmasi untuk status final). Admin **tidak** memilih "bertugas atas nama": `p_pegawai_id` dikosongkan, dan butir timeline-nya tampil "oleh Admin". Untuk **Kanwil** tidak ada panel (baca saja).
- Timeline internal menonjolkan **keterangan penolakan**: butir berstatus Ditolak memakai latar `Latar bahaya` agar alasan penolakan mudah dibaca Kanwil.

### 8.5 Laporan kegiatan `/kanwil/kegiatan` dan detail

Sama dengan 7.4, baca saja. Tambahan filter UPT dan "Hanya yang digantikan". Detail menampilkan semua isian, foto, dan PDF (diunduh lewat signed URL dari server), tanpa tombol ubah dan hapus.

### 8.6 Desa binaan `/kanwil/desa-binaan`

- Tabel desa binaan (18 baris saat ini): Desa · Kecamatan · Kabupaten/Kota · UPT · PIMPASA aktif · Kegiatan terakhir.
- **Tetapkan desa binaan** (dialog): pilih Kabupaten → Kecamatan → Desa/Kelurahan (hanya yang belum DBI) → konfirmasi. Memanggil `tetapkan_dbi`.
- **Cabut status DBI** (tindakan merah pada baris): dialog konfirmasi menyebut jumlah penugasan aktif di desa itu yang **ikut ditutup** ("{n} penugasan PIMPASA akan diakhiri dengan alasan desa dicabut"). Setelah berhasil tampilkan jumlah yang dikembalikan fungsi `cabut_dbi`.
- Alur usulan UPT dan persetujuan Kanwil **[DITUNDA]** (berjalan di luar aplikasi; Kanwil yang mencatat hasilnya).

### 8.7 Penugasan PIMPASA `/kanwil/penugasan`

- Tabel penugasan dengan sakelar **Berlaku / Riwayat**. Kolom: Pegawai · UPT · Desa · Sejak · Sampai · Alasan berakhir. Filter UPT, desa, pegawai.
- **Tugaskan PIMPASA** (dialog): pilih desa binaan, lalu pegawai (disaring ke pegawai aktif dari UPT yang membawahi desa itu), tanggal mulai (awal hari ini WIB). Galat dari database ditampilkan apa adanya, mis. "Pegawai bukan dari kantor imigrasi yang membawahi wilayah desa ini".
- **Akhiri penugasan** (dialog): tanggal selesai (awal hari ini WIB), alasan (Rotasi, Mutasi, Lainnya; "Desa dicabut" hanya dipakai otomatis oleh sistem).
- **Koreksi tanggal**: ubah tanggal mulai atau selesai. Desa dan pegawai **tidak** bisa diganti (pesan database: akhiri lalu buat yang baru); kolom itu tampil terkunci.
- Tidak ada tombol hapus.

### 8.8 Wilayah kerja `/kanwil/wilayah-kerja`

- Tabel 12 kabupaten/kota dengan UPT pelayannya.
- **Ubah** per baris: pilih UPT baru. Sebelum konfirmasi, tampilkan dampak: "Laporan masyarakat yang sudah masuk **tetap di UPT lama**. {n} penugasan PIMPASA di desa binaan kabupaten ini akan diakhiri; Kanwil perlu menugaskan petugas baru dari UPT tujuan." ({n} dihitung dari penugasan berlaku di desa binaan pada kabupaten itu). Setelah berhasil, tampilkan jumlah yang dikembalikan `ubah_wilayah_kerja`.
- Pemindahan laporan antar-UPT **[DITUNDA]**.

### 8.9 FAQ `/kanwil/faq`

- Daftar FAQ berurutan, dapat diubah urutannya (tombol naik/turun, atau kolom angka urutan).
- **Tambah/Ubah** (dialog): Pertanyaan (maks 250, penghitung), Jawaban (maks 5000, penghitung; teks biasa, baris baru dipertahankan).
- **Hapus** dengan konfirmasi.
- **Peringatan permanen** di bagian atas halaman: "Semua FAQ langsung tampil ke publik. Isi hanya setelah siap." Tombol "Lihat halaman publik" membuka `/informasi`.
- Rencana topik awal: apa itu Timpora, Pimpasa, TPPO/TPPM, paspor, izin tinggal.

### 8.10 Pengaturan `/kanwil/pengaturan`

Dua tab:

**Umum**: kartu pengaturan, masing-masing dengan tombol Simpan sendiri.

| Pengaturan | Isian | Keterangan bantu |
|---|---|---|
| Batas hari laporan belum ditanggapi | angka 1–999 | "Berlaku untuk pantauan Kanwil dan penanda terlambat di dashboard UPT. Tidak termasuk hari libur." |
| Waktu hapus laporan kegiatan (menit) | angka 1–999 | "Lama UPT boleh menghapus laporan kegiatan setelah dibuat." |
| Toleransi jarak dari batas Riau (meter) | angka 0–99999 | "Menutup selisih GPS dan garis pantai." |

Hasil `0 baris` saat menyimpan (ditolak RLS) harus ditampilkan sebagai galat, jangan dianggap sukses. Saklar `validasi_lokasi_aktif` **tidak tampil** di halaman ini (khusus admin, di `/admin/status`).

**Jenis kegiatan**: daftar (nama, status aktif), tambah, ubah nama, aktif/nonaktif. Tidak ada hapus. Nama ganda → "Nama jenis kegiatan sudah ada."

Hari libur: **[DITUNDA]** (jangan buat menu atau halamannya; tabelnya sudah siap).

---

## 9. Halaman khusus admin

### 9.1 Status sistem `/admin/status`

Dari `dashboard_admin_status`:
- Kartu **Validasi lokasi**: saklar On/Off. Mematikan memunculkan dialog: "Mematikan validasi memungkinkan laporan dari luar Provinsi Riau masuk. Gunakan hanya untuk pengujian. Lanjutkan?" Saat mati, banner merah global tampil (bagian 6). Izin lokasi di form tetap wajib dan koordinat tetap disimpan; yang dilewati hanya pengecekan "di dalam Riau".
- Kartu jumlah akun: admin, Kanwil, UPT, nonaktif.
- Pengujian mengikuti AGENTS.md bagian 6 poin 9 (tanpa mode "semua policy lolos").

### 9.2 Akun `/admin/akun` *(tahap akhir)*

Dikerjakan lewat jalur server dan Admin API (KONTRAK_API bagian 7):
- Tabel akun: Username · Nama tampil · Peran · Kantor · Aktif.
- **Buat akun**: username (huruf kecil), nama tampil, peran, kantor (wajib hanya untuk UPT), password awal. **Password tidak pernah ditampilkan ulang atau disimpan.**
- **Reset password**: admin memasukkan password baru; setelah itu tidak ditampilkan lagi.
- **Nonaktifkan/Aktifkan** akun.
- **Masuk sebagai** (impersonasi, untuk pengujian): membuka sesi di jendela baru dengan banner "Anda masuk sebagai {akun}"; setiap impersonasi tercatat di log saat log aktif.

### 9.3 Log aktivitas `/admin/log` *(tahap akhir)*

Tabel log (`log_aktivitas`): Waktu · Akun · Peran · Petugas atas nama · Aksi · Tabel · Keterangan. Filter akun, tabel, aksi, rentang tanggal. Klik baris menampilkan perbandingan `data_lama` dan `data_baru` (hanya kolom yang berubah). Tabel kosong menampilkan: "Belum ada catatan. Pencatat log baru aktif saat production." Menu dan halaman ini baru dibuat setelah log diaktifkan.

---

## 10. Halaman umum

### 10.1 Ganti password `/akun/password`

Bagi semua peran yang login. Kolom: Password saat ini, Password baru, Ulangi password baru. Aturan: minimal 8 karakter, berbeda dari password saat ini, tidak sama dengan username. Server memverifikasi password saat ini sebelum mengganti (KONTRAK_API 3a). Berhasil: toast "Password diganti." dan sesi tetap berlaku. Himbauan awal "ganti password awal" disampaikan langsung oleh Kanwil kepada UPT; **pemaksaan ganti password di login pertama [DITUNDA]** karena membutuhkan kolom penanda di database.

### 10.2 Halaman galat

- `/404`: "Halaman tidak ditemukan." dengan tombol ke beranda sesuai peran (atau `/` untuk publik).
- `/403`: "Anda tidak memiliki akses ke halaman ini."
- Galat tak terduga: halaman "Terjadi kesalahan" dengan tombol Muat ulang; galat teknis tidak ditampilkan ke pengguna.

---

## 11. Komponen bersama

Satu komponen, banyak pemakaian. Letakkan di `app/components` sesuai pembagian pustaka (2.4).

| Komponen | Dipakai di |
|---|---|
| `StatusBadge` (warna dari 2.2) | semua tampilan status laporan |
| `TimelineStatus` | dialog berhasil, `/lacak`, detail laporan (mode internal menambah baris petugas) |
| `KartuAngka` | dashboard UPT dan Kanwil |
| `TabelData` (urut, paginasi sisi server, keadaan memuat/kosong/galat) | semua daftar |
| `FilterPeriode` (Bulan ini, Bulan lalu, Tahun ini, Kustom) | dashboard Kanwil, peringkat, tren |
| `UnggahFile` (jenis, batas ukuran, kompres foto, pratinjau, kemajuan) | form lapor, form kegiatan |
| `DialogKonfirmasi` | semua tindakan final atau merusak |
| `StateKosong`, `StateGalat`, `StateMemuat` | semua halaman data |
| `BannerGlobal` | kerangka dashboard |
| `FieldForm` (label, galat, penghitung karakter) | semua form |

---

## 12. Perilaku lintas halaman

**Keadaan data (wajib di setiap halaman yang memuat data):**
- **Memuat**: kerangka (skeleton) berbentuk konten, bukan layar kosong.
- **Kosong**: pesan khusus per daftar (sudah disebut per halaman) dan, bila relevan, tombol tindakan.
- **Galat**: pesan Bahasa Indonesia dan tombol **Coba lagi**. Galat database sudah berbahasa Indonesia dan aman ditampilkan (KONTRAK_API bagian 9); galat tak dikenal diganti pesan umum.

**Umpan balik tindakan:**
- Berhasil: toast singkat. Gagal: pesan galat di dekat aksi.
- Tombol aksi dikunci selama proses berjalan (cegah kirim ganda).
- Setiap `update` atau `delete` harus memeriksa **jumlah baris terdampak**; 0 baris berarti ditolak, bukan sukses (KONTRAK_API bagian 9).
- Tindakan final atau merusak (status final, hapus, cabut DBI, ubah wilayah kerja) selalu memakai dialog konfirmasi yang menyebut dampaknya.
- Konfirmasi sebelum meninggalkan form yang sudah diubah dan belum disimpan.

**Tanggal, angka, teks:**
- Semua waktu dari database (UTC) ditampilkan dalam **WIB**: `16 Nov 2026, 14.30 WIB`; hanya tanggal: `16 Nov 2026`. Satu fungsi utilitas di `shared/` untuk semua pemformatan.
- Isian tanggal dan "hari ini" memakai tanggal WIB, bukan UTC server.
- Angka berformat Indonesia (`1.862`). Waktu relatif ("3 hari lalu") selalu disertai tooltip tanggal lengkap.
- Teks isian pengguna (isi laporan, keterangan, FAQ) selalu **di-escape**; tidak ada `v-html`.

**Teks terpusat:** label status, label WNA/WNI, label peran, label jenis wilayah, pesan galat umum, dan teks yang berulang disimpan di `shared/config/` (AGENTS.md bagian 5), bukan ditulis berulang di komponen.

---

## 13. Responsif dan aksesibilitas

- **Publik**: dirancang dari 360 px ke atas. Satu kolom di HP; dua kolom hanya di `/informasi` pada layar lebar.
- **Dashboard**: dirancang untuk ≥ 1024 px; tablet 768 px tetap dapat dipakai. Di layar < 768 px, sidebar menjadi panel geser dan tabel menjadi daftar kartu.
- Setiap kolom isian punya `label` terhubung, pesan galat dibaca pembaca layar (`aria-live`/`aria-describedby`), dan urutan fokus keyboard wajar.
- Fokus terlihat jelas (cincin biru `--ring`). Lencana status tidak hanya mengandalkan warna: selalu ada teks label.
- Hormati preferensi `prefers-reduced-motion` (kurangi animasi akordeon dan transisi).
- Gambar diberi teks alternatif; ikon dekoratif disembunyikan dari pembaca layar.
- Performa: grafik dimuat saat dibutuhkan (lazy), foto dikompres sebelum unggah, daftar besar memakai paginasi sisi server.

---

## 14. Di luar versi pertama [DITUNDA]

Jangan dibuat tanpa permintaan baru dari pemilik project:
- Alur persetujuan Kanwil atas penugasan PIMPASA dan usulan desa binaan baru di aplikasi.
- Memindahkan laporan masyarakat antar-UPT.
- Halaman pengelolaan hari libur.
- Hari kerja Sabtu dan Minggu untuk UPT tertentu (pelayanan publik dan beranda imigrasi).
- Akun Rudenim.
- Peta (titik laporan, peta desa binaan).
- Mode gelap, notifikasi, dan ekspor lanjutan.
- Pemaksaan ganti password di login pertama.
- Log aktivitas aktif (dinyalakan saat production) dan halamannya `/admin/log`.

---

## 15. Kriteria penerimaan (cek akhir)

**Masyarakat**
- [ ] Form `/lapor` tidak bisa diisi atau dikirim sebelum lokasi terdeteksi; setiap keadaan lokasi (menunggu, ditolak, GPS mati, waktu habis, tidak didukung) menampilkan pesannya sendiri.
- [ ] Kabupaten → Kecamatan → Desa berantai; nama kantor tampil setelah kabupaten dipilih.
- [ ] Foto opsional, maksimal 1, dikompres dan ditolak jelas bila melebihi 3 MB.
- [ ] Setelah kirim: dialog menampilkan kode, tombol salin, dan timeline berisi "Diterima".
- [ ] Kirim dari luar Riau menampilkan pesan yang benar dan isian tidak hilang; kirim ganda dicegah.
- [ ] `/lacak` menampilkan status dan timeline, tidak pernah nama, alamat, isi laporan, atau petugas.
- [ ] `/informasi` memakai akordeon satu-terbuka; jawaban tidak dirender sebagai HTML.

**UPT**
- [ ] Setelah login wajib memilih petugas; nama tampil di header dan dikirim sebagai `x-bertugas-id`.
- [ ] Dashboard menampilkan 5 kartu, daftar perlu tindakan (dengan sisa atau terlambat), tabel desa binaan, dan tren; **tanpa peringkat antar-UPT**.
- [ ] Daftar laporan tidak menampilkan nama dan alamat pelapor; detail menampilkannya.
- [ ] Panel ubah status hanya menawarkan status yang sah; keterangan wajib untuk Ditolak dan Selesai; konfirmasi untuk status final.
- [ ] Laporan kegiatan: file diunggah lebih dulu, baris dibuat tanpa `kantor_id`, `dibuat_oleh`, `petugas_pengganti`; hapus hanya selama jendela waktu dengan hitung mundur.
- [ ] Nonaktifkan pegawai yang masih bertugas ditolak dengan pesan yang jelas.

**Kanwil dan admin**
- [ ] Semua halaman laporan baca saja untuk Kanwil; tidak ada kontrol ubah status. Admin dapat mengubah status lewat 8.4 tanpa memilih petugas.
- [ ] Peringkat dapat diganti periode (bulanan, tahunan, bebas) dan tab Desa punya saklar kandidat DBI.
- [ ] Cabut DBI dan ubah wilayah kerja menampilkan dampak sebelum konfirmasi dan jumlah penutupan sesudahnya.
- [ ] Pengaturan yang ditolak database (0 baris) tampil sebagai galat.
- [ ] Banner merah tampil di tampilan admin saat validasi lokasi dimatikan.

**Umum**
- [ ] Setiap halaman data punya keadaan memuat, kosong, dan galat.
- [ ] Semua waktu tampil WIB; tidak ada kode hex di luar `shared/config/tema.ts`; tidak ada teks status atau label ganda di banyak file.
- [ ] Rute petugas tidak dapat dibuka tanpa login atau dengan peran yang salah.

---

## 16. Urutan pengerjaan yang disarankan

Kerjakan bertahap; selesaikan dan uji satu tahap sebelum lanjut.

| Tahap | Isi |
|---|---|
| 1. Kerangka | Struktur folder MVC, `shared/config` (app, tema, teks, batas file), client Supabase (browser, sesi pengguna, service role), utilitas WIB, `.env.example`, tata letak publik dan dashboard, middleware rute |
| 2. Masyarakat | Landing, `/informasi`, `/lapor` (lokasi, kirim, dialog), `/lacak` |
| 3. Login dan UPT | `/masuk`, pilih petugas, ganti password, dashboard UPT, laporan masyarakat (daftar, detail, ubah status), laporan kegiatan, pegawai, profil |
| 4. Kanwil | Dashboard, peringkat, pantauan, laporan baca saja, desa binaan, penugasan, wilayah kerja, FAQ, pengaturan |
| 5. Admin dan penutup | Status sistem, akun, impersonasi, aktivasi log dan halaman log, polesan, pemeriksaan kriteria penerimaan |

---

## 17. Asumsi dan hal yang perlu diisi pemilik project

| Hal | Status |
|---|---|
| Logo SAPA DESA | `public/images/logo.webp`; logo instansi di `LOGO_INSTANSI` |
| Teks hero landing dan judul-judul pemasaran | [USULAN] di config, boleh diganti |
| Kontak instansi di footer | sudah ada di `KONTAK_INSTANSI` (alamat, telepon, email, Instagram, TikTok). **URL Instagram diasumsikan `instagram.com/imigrasiriau`; mohon dipastikan** |
| Isi FAQ | diisi admin/Kanwil lewat dashboard |
| Warna status laporan, ambang "desa lama" (30 hari), font | [USULAN] |
| Jenis ikon dan gaya ilustrasi | bebas selama konsisten |
