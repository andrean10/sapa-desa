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
  sesiBerakhir: 'Sesi berakhir, silakan masuk lagi.',
  keteranganPublik: 'Keterangan ini dapat dilihat oleh pelapor',
  modeUjiCoba: 'MODE UJI COBA',
  identitasPetugas: 'Masuk petugas',
  privasi: 'Privasi',
  navigasiUtama: 'Navigasi utama',
  bukaMenu: 'Buka menu',
  tutup: 'Tutup'
} as const
