import type { Enums } from '../types/database.types'
import { WARNA_STATUS } from './tema'

export const STATUS_LAPORAN = [
  { value: 'diterima', label: 'Diterima', penjelasan: 'Laporan Anda sudah masuk dan menunggu diperiksa petugas.', urutanTimeline: 1 },
  { value: 'diverifikasi', label: 'Diverifikasi', penjelasan: 'Petugas sudah memeriksa laporan Anda.', urutanTimeline: 2 },
  { value: 'ditindaklanjuti', label: 'Ditindaklanjuti', penjelasan: 'Laporan Anda sedang ditangani.', urutanTimeline: 3 },
  { value: 'selesai', label: 'Selesai', penjelasan: 'Penanganan laporan sudah selesai.', urutanTimeline: 4 },
  { value: 'ditolak', label: 'Ditolak', penjelasan: 'Laporan tidak dapat diproses. Lihat keterangan petugas.', urutanTimeline: 5 }
] as const satisfies readonly {
  value: Enums<'status_laporan'>
  label: string
  penjelasan: string
  urutanTimeline: number
}[]

export const STATUS_LAPORAN_TAMPILAN = STATUS_LAPORAN.map(status => ({
  ...status,
  warna: WARNA_STATUS[status.value]
}))

export const JENIS_TERLAPOR = [
  { value: 'wna', label: 'Warga Negara Asing (WNA)' },
  { value: 'wni', label: 'Warga Negara Indonesia (WNI)' }
] as const satisfies readonly { value: Enums<'jenis_terlapor'>; label: string }[]

export const PERAN_PENGGUNA = [
  { value: 'admin', label: 'Admin' },
  { value: 'kanwil', label: 'Kanwil' },
  { value: 'upt', label: 'UPT' }
] as const satisfies readonly { value: Enums<'peran_pengguna'>; label: string }[]

export const JENIS_WILAYAH_DESA = [
  { value: 'desa', label: 'Desa' },
  { value: 'kelurahan', label: 'Kelurahan' },
  { value: 'kampung', label: 'Kampung' },
  { value: 'kepenghuluan', label: 'Kepenghuluan' }
] as const satisfies readonly { value: Enums<'jenis_wilayah_desa'>; label: string }[]

export const ALASAN_BERAKHIR_PENUGASAN = [
  { value: 'rotasi', label: 'Rotasi' },
  { value: 'mutasi', label: 'Mutasi' },
  { value: 'desa_dicabut', label: 'Desa binaan dicabut' },
  { value: 'lainnya', label: 'Lainnya' }
] as const satisfies readonly { value: Enums<'alasan_berakhir_penugasan'>; label: string }[]

export const LABEL_MENU = {
  dashboard: 'Dashboard',
  laporan: 'Laporan Masyarakat',
  kegiatan: 'Laporan Kegiatan',
  pegawai: 'Pegawai',
  profil: 'Profil Kantor',
  peringkat: 'Peringkat',
  pantauan: 'Pantauan',
  desaBinaan: 'Desa Binaan',
  penugasan: 'Penugasan PIMPASA',
  wilayahKerja: 'Wilayah Kerja',
  faq: 'FAQ',
  pengaturan: 'Pengaturan',
  statusSistem: 'Status sistem',
  akun: 'Akun',
  log: 'Log aktivitas'
} as const

export const NAVIGASI_PUBLIK = [
  { label: 'Beranda', href: '/' },
  { label: 'Informasi', href: '/informasi' },
  { label: 'Buat Laporan', href: '/lapor' },
  { label: 'Cek Status', href: '/lacak' }
] as const

export const TEKS_LANDING = {
  judul: 'Lihat sesuatu yang mencurigakan di desa Anda?',
  pengantar: 'Sampaikan laporan keimigrasian dari wilayah Riau dan pantau tindak lanjutnya dengan kode laporan.',
  langkah: [
    { judul: 'Isi laporan di HP Anda', keterangan: 'Pilih wilayah dan ceritakan hal yang ingin Anda laporkan.' },
    { judul: 'Petugas setempat menindaklanjuti', keterangan: 'Laporan diteruskan ke kantor imigrasi yang menangani wilayah tersebut.' },
    { judul: 'Pantau dengan kode laporan', keterangan: 'Gunakan kode pelacakan untuk melihat status laporan.' }
  ],
  faqJudul: 'Informasi keimigrasian',
  faqLihatSemua: 'Lihat semua informasi',
  cekStatus: 'Cek Status Laporan'
} as const

export const TEKS_FAQ = {
  judul: 'Pertanyaan yang Sering Diajukan',
  label: 'FAQ',
  ajakanJudul: 'Ingin melapor?',
  ajakanIsi: 'Laporkan langsung dan pantau dengan kode laporan.',
  kosong: 'Informasi belum tersedia. Anda tetap dapat membuat laporan.',
  gagal: 'Informasi gagal dimuat.',
  cari: 'Cari pertanyaan atau jawaban',
  ulang: 'Coba lagi'
} as const

export const TEKS_LAPORAN_PUBLIK = {
  judul: 'Kirim laporan pengaduan',
  tungguLokasi: 'Aktifkan lokasi untuk melanjutkan. Laporan hanya dapat dikirim dari wilayah Provinsi Riau.',
  lokasiTerdeteksi: 'Lokasi terdeteksi',
  izinDitolak: 'Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini di pengaturan browser, lalu coba lagi.',
  gpsMati: 'Lokasi perangkat tidak tersedia. Nyalakan GPS atau layanan lokasi di HP Anda, lalu coba lagi.',
  gpsTimeout: 'Lokasi belum berhasil dideteksi. Pastikan sinyal dan GPS aktif, lalu coba lagi.',
  gpsTidakDidukung: 'Browser atau koneksi Anda tidak mendukung deteksi lokasi. Buka tautan ini lewat browser terbaru.',
  izinkanLokasi: 'Izinkan Lokasi',
  cobaLagi: 'Coba lagi',
  memintaLokasi: 'Mendeteksi lokasi…',
  nama: 'Nama lengkap',
  alamat: 'Alamat Anda',
  kabupaten: 'Kabupaten/Kota',
  kecamatan: 'Kecamatan',
  desa: 'Desa/Kelurahan',
  kantor: 'Laporan Anda akan dilayani oleh:',
  jenisTerlapor: 'Siapa yang Anda laporkan?',
  isi: 'Apa yang ingin Anda laporkan?',
  foto: 'Foto pendukung (opsional)',
  pilihFoto: 'Pilih foto atau ambil dengan kamera',
  hapusFoto: 'Hapus foto',
  tindakLanjut: 'Ini tindak lanjut laporan sebelumnya?',
  kodeSebelumnya: 'Kode laporan sebelumnya',
  kirim: 'Kirim Laporan',
  mengirim: 'Mengirim…',
  gagalKirim: 'Laporan belum terkirim. Periksa koneksi Anda lalu coba lagi.',
  lokasiDiLuarRiau: 'Lokasi Anda terdeteksi di luar Provinsi Riau. Laporan hanya dapat dikirim dari wilayah Riau.',
  terlaluBanyak: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
  kodeSebelumnyaTidakAda: 'Kode laporan sebelumnya tidak ditemukan. Periksa penulisannya atau kosongkan kolom itu.',
  fotoDitolak: 'Foto harus berformat JPEG, PNG, atau WebP dan berukuran maksimal 3 MB.',
  desaTidakValid: 'Desa atau kelurahan yang dipilih tidak valid. Pilih ulang dari daftar.',
  sukses: 'Laporan berhasil dikirim',
  simpanKode: 'Simpan kode ini. Anda memerlukannya untuk memantau laporan.',
  salinKode: 'Salin kode',
  tersalin: 'Tersalin',
  cekStatus: 'Cek status',
  tutup: 'Tutup',
  konfirmasiTutup: 'Pastikan kode sudah Anda simpan. Kode tidak dapat ditampilkan lagi.'
} as const

export const TEKS_LACAK_PUBLIK = {
  judul: 'Cek status laporan',
  petunjuk: 'Masukkan kode pelacakan yang diberikan setelah laporan dikirim.',
  labelKode: 'Kode laporan',
  contohKode: 'SD-7KQ2-M9XP',
  cek: 'Cek Status',
  muatUlang: 'Muat ulang',
  statusKini: 'Status saat ini',
  tidakDitemukan: 'Kode tidak ditemukan. Periksa kembali penulisan kode Anda.',
  terlaluBanyak: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
  gagal: 'Status laporan belum dapat dimuat. Periksa koneksi Anda lalu coba lagi.',
  mengirim: 'Memeriksa status…',
  riwayat: 'Riwayat laporan'
} as const

export const TEKS_UMUM = {
  beranda: 'Beranda',
  galatUmum: 'Terjadi kendala. Silakan coba lagi.',
  cobaLagi: 'Coba lagi',
  memuat: 'Memuat data…',
  dataKosong: 'Belum ada data untuk ditampilkan.',
  keluar: 'Keluar',
  gantiPassword: 'Ganti password',
  gantiPetugas: 'Ganti petugas',
  aksesDitolak: 'Anda tidak memiliki akses ke halaman itu.',
  akunNonaktif: 'Akun Anda dinonaktifkan. Hubungi admin.',
  terlaluBanyakPercobaan: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
  sesiBerakhir: 'Sesi berakhir, silakan masuk lagi.',
  keteranganPublik: 'Keterangan ini dapat dilihat oleh pelapor',
  modeUjiCoba: 'MODE UJI COBA',
  identitasPetugas: 'Masuk petugas',
  navigasiUtama: 'Navigasi utama',
  bukaMenu: 'Buka menu',
  tutup: 'Tutup'
} as const

export const LABEL_FORM = {
  nama: 'Nama',
  nip: 'NIP',
  status: 'Status',
  tanggal: 'Tanggal',
  desa: 'Desa binaan',
  petugas: 'Petugas',
  jenisKegiatan: 'Jenis kegiatan',
  jumlahPeserta: 'Jumlah peserta',
  keterangan: 'Keterangan',
  lampiran: 'Lampiran',
  aksi: 'Aksi'
} as const

export const TEKS_LOGIN = {
  judul: 'Masuk petugas',
  pengantar: 'Gunakan akun yang diberikan oleh administrator.',
  username: 'Username',
  password: 'Kata sandi',
  bantuan: 'Lupa password? Hubungi admin.',
  tampilkan: 'Tampilkan kata sandi',
  sembunyikan: 'Sembunyikan kata sandi',
  memproses: 'Memeriksa akun…',
  masuk: 'Masuk',
  gagal: 'Login belum dapat diproses.'
} as const
