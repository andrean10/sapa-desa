import type { Enums } from '../types/database.types'

export const APP_NAME = 'SAPA DESA'
export const APP_TAGLINE = 'Pelayanan dan pengawasan keimigrasian di Riau.'
export const ORGANIZATION_NAME = 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia'
export const REGIONAL_OFFICE_NAME = 'Kantor Wilayah Direktorat Jenderal Imigrasi Riau'

export const AUTH_EMAIL_DOMAIN = 'sapadesa.com'
export const TIMEZONE = 'Asia/Jakarta'

// Palet diambil dari prototype SAPA DESA; ubah warna aplikasi dari satu tempat ini.
export const THEME_COLORS = {
  primary: '#17365d',
  primaryForeground: '#ffffff',
  secondary: '#285783',
  secondaryForeground: '#ffffff',
  accent: '#c6a34a',
  accentForeground: '#203047',
  background: '#f3f6fa',
  foreground: '#203047',
  surface: '#ffffff',
  muted: '#718096',
  border: '#dce4ee',
  destructive: '#b74646',
  destructiveForeground: '#ffffff'
} as const

// Nama variable mengikuti token CSS yang lazim dipetakan ke shadcn-vue.
export const THEME_CSS_VARIABLES = {
  '--primary': THEME_COLORS.primary,
  '--primary-foreground': THEME_COLORS.primaryForeground,
  '--secondary': THEME_COLORS.secondary,
  '--secondary-foreground': THEME_COLORS.secondaryForeground,
  '--accent': THEME_COLORS.accent,
  '--accent-foreground': THEME_COLORS.accentForeground,
  '--background': THEME_COLORS.background,
  '--foreground': THEME_COLORS.foreground,
  '--card': THEME_COLORS.surface,
  '--card-foreground': THEME_COLORS.foreground,
  '--muted': THEME_COLORS.background,
  '--muted-foreground': THEME_COLORS.muted,
  '--border': THEME_COLORS.border,
  '--input': THEME_COLORS.border,
  '--ring': THEME_COLORS.primary,
  '--destructive': THEME_COLORS.destructive,
  '--destructive-foreground': THEME_COLORS.destructiveForeground
} as const

export const STATUS_LAPORAN = [
  { value: 'diterima', label: 'Diterima', badgeColor: THEME_COLORS.secondary, urutanTimeline: 1 },
  { value: 'diverifikasi', label: 'Diverifikasi', badgeColor: THEME_COLORS.accent, urutanTimeline: 2 },
  { value: 'ditindaklanjuti', label: 'Ditindaklanjuti', badgeColor: THEME_COLORS.primary, urutanTimeline: 3 },
  { value: 'selesai', label: 'Selesai', badgeColor: THEME_COLORS.muted, urutanTimeline: 4 },
  { value: 'ditolak', label: 'Ditolak', badgeColor: THEME_COLORS.destructive, urutanTimeline: 5 }
] as const satisfies readonly {
  value: Enums<'status_laporan'>
  label: string
  badgeColor: string
  urutanTimeline: number
}[]

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

export const BATAS_FILE = {
  foto: {
    ukuranMaksimumByte: 3 * 1024 * 1024,
    tipeDiizinkan: ['image/jpeg', 'image/png', 'image/webp']
  },
  pdf: {
    ukuranMaksimumByte: 8 * 1024 * 1024,
    tipeDiizinkan: ['application/pdf']
  }
} as const

export const FORMAT_KODE_PELACAKAN = 'SD-XXXX-XXXX'
export const POLA_KODE_PELACAKAN = '^SD-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'
export const REGEX_KODE_PELACAKAN = new RegExp(POLA_KODE_PELACAKAN)
