import type { Enums } from '../types/database.types'

// Seluruh nilai warna aplikasi tinggal di file ini.
export const WARNA = {
  biruTua: '#17365d',
  biru: '#285783',
  emas: '#c6a34a',
  latar: '#f3f6fa',
  teks: '#203047',
  permukaan: '#ffffff',
  teksDiAtasEmas: '#18283c',
  garis: '#dce4ee',
  garisIsian: '#cbd6e3',
  redam: '#eaf0f6',
  teksRedam: '#718096',
  bahaya: '#b74646',
  latarBahaya: '#fae9e9',
  latarPeringatan: '#fff8e7',
  teksPeringatan: '#705b24',
  biruMuda: '#6b8fb5',
  abu: '#9aa8b8',
  latarSelesai: '#e6f4ea',
  teksSelesai: '#1e6b3a',
  latarDitindaklanjuti: '#dbe6f2'
} as const

export const WARNA_STATUS: Record<Enums<'status_laporan'>, { latar: string; teks: string }> = {
  diterima: { latar: WARNA.redam, teks: WARNA.biruTua },
  diverifikasi: { latar: WARNA.latarPeringatan, teks: WARNA.teksPeringatan },
  ditindaklanjuti: { latar: WARNA.latarDitindaklanjuti, teks: WARNA.biru },
  selesai: { latar: WARNA.latarSelesai, teks: WARNA.teksSelesai },
  ditolak: { latar: WARNA.latarBahaya, teks: WARNA.bahaya }
}

export const VARIABEL_TEMA = {
  '--background': WARNA.latar,
  '--foreground': WARNA.teks,
  '--card': WARNA.permukaan,
  '--card-foreground': WARNA.teks,
  '--popover': WARNA.permukaan,
  '--popover-foreground': WARNA.teks,
  '--primary': WARNA.biruTua,
  '--primary-foreground': WARNA.permukaan,
  '--secondary': WARNA.redam,
  '--secondary-foreground': WARNA.biruTua,
  '--muted': WARNA.redam,
  '--muted-foreground': WARNA.teksRedam,
  '--accent': WARNA.emas,
  '--accent-foreground': WARNA.teksDiAtasEmas,
  '--destructive': WARNA.bahaya,
  '--destructive-foreground': WARNA.permukaan,
  '--border': WARNA.garis,
  '--input': WARNA.garisIsian,
  '--ring': WARNA.biru,
  '--chart-1': WARNA.biruTua,
  '--chart-2': WARNA.biru,
  '--chart-3': WARNA.emas,
  '--chart-4': WARNA.biruMuda,
  '--chart-5': WARNA.abu,
  '--sidebar': WARNA.biruTua,
  '--sidebar-foreground': WARNA.permukaan,
  '--sidebar-primary': WARNA.emas,
  '--sidebar-primary-foreground': WARNA.teksDiAtasEmas,
  '--sidebar-accent': WARNA.biru,
  '--sidebar-accent-foreground': WARNA.permukaan,
  '--sidebar-border': WARNA.biru,
  '--sidebar-ring': WARNA.emas,
  '--radius': '0.75rem',
  '--radius-control': '0.5rem'
} as const

export function buatGayaTema(): string {
  return Object.entries(VARIABEL_TEMA).map(([nama, nilai]) => `${nama}: ${nilai}`).join('; ')
}
