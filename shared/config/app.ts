import type { Enums } from '../types/database.types'
import { LABEL_MENU } from './teks'

export const APP_NAME = 'SAPA DESA'
export const PUBLIC_BRAND_NAME = 'SISTEM PELAPORAN PEMANTAUAN AKTIFITAS DESA BINAAN IMIGRASI'
export const APP_TAGLINE = 'Pelayanan dan pengawasan keimigrasian di Riau.'
export const ORGANIZATION_NAME = 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia'
export const REGIONAL_OFFICE_NAME = 'Kantor Wilayah Direktorat Jenderal Imigrasi Riau'

export const AUTH_EMAIL_DOMAIN = 'sapadesa.com'
export const TIMEZONE = 'Asia/Jakarta'
export const AMBANG_DESA_LAMA_HARI = 30
export const BATAS_WAKTU_GPS_MS = 15_000
// Selama rentang ini profil akun di browser dianggap masih valid saat pindah menu (tanpa memanggil /api/auth/me lagi).
// Hanya memengaruhi routing; setiap endpoint server tetap memverifikasi sesi dan peran sendiri.
export const MASA_BERLAKU_PROFIL_MS = 60_000

export const FORMAT_KODE_PELACAKAN = 'XXX000'
export const POLA_KODE_PELACAKAN = '^[A-Z]{3}[0-9]{3}$'
export const REGEX_KODE_PELACAKAN = new RegExp(POLA_KODE_PELACAKAN)

export type PeranAplikasi = Enums<'peran_pengguna'>

export const MENU_PERAN: Record<PeranAplikasi, readonly { label: string; href: string }[]> = {
  upt: [
    { label: LABEL_MENU.dashboard, href: '/upt' },
    { label: LABEL_MENU.laporan, href: '/upt/laporan' },
    { label: LABEL_MENU.kegiatan, href: '/upt/kegiatan' },
    { label: LABEL_MENU.pegawai, href: '/upt/pegawai' },
    { label: LABEL_MENU.profil, href: '/upt/profil' }
  ],
  kanwil: [
    { label: LABEL_MENU.dashboard, href: '/kanwil' },
    { label: LABEL_MENU.peringkat, href: '/kanwil/peringkat' },
    { label: LABEL_MENU.pantauan, href: '/kanwil/pantauan' },
    { label: LABEL_MENU.laporan, href: '/kanwil/laporan' },
    { label: LABEL_MENU.kegiatan, href: '/kanwil/kegiatan' }
    // Menu "Pengelolaan" (desa binaan, penugasan, wilayah kerja, FAQ, pengaturan) disembunyikan dari sidebar Kanwil; hanya admin yang melihatnya.
  ],
  admin: [
    { label: LABEL_MENU.dashboard, href: '/kanwil' },
    { label: LABEL_MENU.peringkat, href: '/kanwil/peringkat' },
    { label: LABEL_MENU.pantauan, href: '/kanwil/pantauan' },
    { label: LABEL_MENU.laporan, href: '/kanwil/laporan' },
    { label: LABEL_MENU.kegiatan, href: '/kanwil/kegiatan' },
    { label: LABEL_MENU.desaBinaan, href: '/kanwil/desa-binaan' },
    { label: LABEL_MENU.penugasan, href: '/kanwil/penugasan' },
    { label: LABEL_MENU.wilayahKerja, href: '/kanwil/wilayah-kerja' },
    { label: LABEL_MENU.faq, href: '/kanwil/faq' },
    { label: LABEL_MENU.pengaturan, href: '/kanwil/pengaturan' },
    { label: LABEL_MENU.statusSistem, href: '/admin/status' },
    { label: LABEL_MENU.akun, href: '/admin/akun' }
  ]
}

/** Kontak resmi instansi (footer landing). */
export const KONTAK_INSTANSI = {
  alamat: 'Jl. Jend. Sudirman No.233, Pekanbaru, Riau 28111',
  telepon: { label: '+62 853-6447-1782', href: 'tel:+6285364471782' },
  email: 'kanwilriau@imigrasi.go.id',
  instagram: { nama: 'Imigrasi Riau', url: 'https://www.instagram.com/imigrasiriau/' },
  tiktok: { nama: '@imigrasiriau', url: 'https://www.tiktok.com/@imigrasiriau' }
} as const

/** Logo instansi yang tampil di landing page (berkas di `public/images`). Tambah atau ganti di sini saja. */
export const LOGO_INSTANSI = [
  { src: '/images/logo_kantor.png', alt: 'Lambang Kementerian Imigrasi dan Pemasyarakatan dan lambang Imigrasi', lebar: 277, tinggi: 144 },
  { src: '/images/logo_jargon_kantor.png', alt: 'Imigrasi untuk Rakyat, #Patenlah', lebar: 293, tinggi: 65 }
] as const

/**
 * Foto landing page. Taruh berkasnya di `public/images/landing/` dengan nama di bawah ini
 * (PNG/WebP). Selama berkas belum ada, landing menampilkan ilustrasi pengganti.
 */
export const FOTO_LANDING = {
  pimpasa: { src: '/images/landing/pimpasa-petugas.webp', alt: 'Petugas Imigrasi Pembina Desa (PIMPASA)', lebar: 720, tinggi: 900 },
  aduan: { src: '/images/landing/aduan-masyarakat.webp', alt: 'Petugas imigrasi melayani aduan masyarakat', lebar: 720, tinggi: 720 }
} as const
