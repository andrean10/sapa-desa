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

export const FORMAT_KODE_PELACAKAN = 'SD-XXXX-XXXX'
export const POLA_KODE_PELACAKAN = '^SD-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'
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
    { label: LABEL_MENU.kegiatan, href: '/kanwil/kegiatan' },
    { label: LABEL_MENU.desaBinaan, href: '/kanwil/desa-binaan' },
    { label: LABEL_MENU.penugasan, href: '/kanwil/penugasan' },
    { label: LABEL_MENU.wilayahKerja, href: '/kanwil/wilayah-kerja' },
    { label: LABEL_MENU.faq, href: '/kanwil/faq' },
    { label: LABEL_MENU.pengaturan, href: '/kanwil/pengaturan' }
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
