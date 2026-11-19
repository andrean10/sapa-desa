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

// Warna status memakai variabel CSS supaya ikut berganti di mode gelap (nilai terang di VARIABEL_TEMA, nilai gelap di VARIABEL_TEMA_GELAP).
/** Palet mode gelap (hanya area dashboard). Biru dibuat lebih terang agar tetap terbaca di latar gelap. */
export const WARNA_GELAP = {
  latar: '#0e1621',
  permukaan: '#16212f',
  teks: '#e4ebf3',
  garis: '#243247',
  garisIsian: '#2f4059',
  redam: '#1c2a3c',
  teksRedam: '#95a5ba',
  biruTerang: '#9dbbdc',
  biru: '#6e9ccb',
  emas: '#d4b25c',
  teksDiAtasEmas: '#18283c',
  teksEmas: '#e7d08c',
  samping: '#0a111b',
  sampingAksen: '#1b2b42',
  bahaya: '#e07878',
  tombolBahaya: '#c44f4f',
  latarBahaya: '#3a1d20',
  latarPeringatan: '#32290f',
  teksPeringatan: '#e3c871',
  latarSelesai: '#12301f',
  teksSelesai: '#79d39a',
  latarInfo: '#1b2d46',
  tersier: '#4f6d90',
  abu: '#7a8798'
} as const

export const WARNA_STATUS: Record<Enums<'status_laporan'>, { latar: string; teks: string }> = {
  diterima: { latar: 'var(--status-diterima-latar)', teks: 'var(--status-diterima-teks)' },
  diverifikasi: { latar: 'var(--status-diverifikasi-latar)', teks: 'var(--status-diverifikasi-teks)' },
  ditindaklanjuti: { latar: 'var(--status-ditindaklanjuti-latar)', teks: 'var(--status-ditindaklanjuti-teks)' },
  selesai: { latar: 'var(--status-selesai-latar)', teks: 'var(--status-selesai-teks)' },
  ditolak: { latar: 'var(--status-ditolak-latar)', teks: 'var(--status-ditolak-teks)' }
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
  '--emas': WARNA.emas,
  '--emas-foreground': WARNA.teksDiAtasEmas,
  '--emas-teks': WARNA.teksDiAtasEmas,
  '--sukses': WARNA.teksSelesai,
  '--sukses-muda': WARNA.latarSelesai,
  '--peringatan': WARNA.teksPeringatan,
  '--peringatan-muda': WARNA.latarPeringatan,
  '--info': WARNA.biru,
  '--info-muda': WARNA.latarDitindaklanjuti,
  '--bahaya-muda': WARNA.latarBahaya,
  '--status-diterima-latar': WARNA.redam,
  '--status-diterima-teks': WARNA.biruTua,
  '--status-diverifikasi-latar': WARNA.latarPeringatan,
  '--status-diverifikasi-teks': WARNA.teksPeringatan,
  '--status-ditindaklanjuti-latar': WARNA.latarDitindaklanjuti,
  '--status-ditindaklanjuti-teks': WARNA.biru,
  '--status-selesai-latar': WARNA.latarSelesai,
  '--status-selesai-teks': WARNA.teksSelesai,
  '--status-ditolak-latar': WARNA.latarBahaya,
  '--status-ditolak-teks': WARNA.bahaya,
  '--radius': '0.75rem',
  '--radius-control': '0.5rem'
} as const

/** Nilai variabel untuk mode gelap; menimpa VARIABEL_TEMA + VARIABEL_TEMA_DASHBOARD saat dashboard dalam mode gelap. */
export const VARIABEL_TEMA_GELAP = {
  '--background': WARNA_GELAP.latar,
  '--foreground': WARNA_GELAP.teks,
  '--card': WARNA_GELAP.permukaan,
  '--card-foreground': WARNA_GELAP.teks,
  '--popover': WARNA_GELAP.permukaan,
  '--popover-foreground': WARNA_GELAP.teks,
  '--primary': WARNA_GELAP.biruTerang,
  '--primary-foreground': WARNA_GELAP.latar,
  '--secondary': WARNA_GELAP.redam,
  '--secondary-foreground': WARNA_GELAP.biruTerang,
  '--muted': WARNA_GELAP.redam,
  '--muted-foreground': WARNA_GELAP.teksRedam,
  '--accent': WARNA_GELAP.redam,
  '--accent-foreground': WARNA_GELAP.teks,
  '--destructive': WARNA_GELAP.tombolBahaya,
  '--destructive-foreground': '#ffffff',
  '--border': WARNA_GELAP.garis,
  '--input': WARNA_GELAP.garisIsian,
  '--ring': WARNA_GELAP.biru,
  '--chart-1': WARNA_GELAP.biruTerang,
  '--chart-2': WARNA_GELAP.biru,
  '--chart-3': WARNA_GELAP.emas,
  '--chart-4': WARNA_GELAP.tersier,
  '--chart-5': WARNA_GELAP.abu,
  '--sidebar': WARNA_GELAP.samping,
  '--sidebar-foreground': WARNA_GELAP.teks,
  '--sidebar-primary': WARNA_GELAP.emas,
  '--sidebar-primary-foreground': WARNA_GELAP.teksDiAtasEmas,
  '--sidebar-accent': WARNA_GELAP.sampingAksen,
  '--sidebar-accent-foreground': WARNA_GELAP.teks,
  '--sidebar-border': WARNA_GELAP.garis,
  '--sidebar-ring': WARNA_GELAP.emas,
  '--emas': WARNA_GELAP.emas,
  '--emas-foreground': WARNA_GELAP.teksDiAtasEmas,
  '--emas-teks': WARNA_GELAP.teksEmas,
  '--sukses': WARNA_GELAP.teksSelesai,
  '--sukses-muda': WARNA_GELAP.latarSelesai,
  '--peringatan': WARNA_GELAP.teksPeringatan,
  '--peringatan-muda': WARNA_GELAP.latarPeringatan,
  '--info': WARNA_GELAP.biruTerang,
  '--info-muda': WARNA_GELAP.latarInfo,
  '--bahaya-muda': WARNA_GELAP.latarBahaya,
  '--status-diterima-latar': WARNA_GELAP.redam,
  '--status-diterima-teks': WARNA_GELAP.biruTerang,
  '--status-diverifikasi-latar': WARNA_GELAP.latarPeringatan,
  '--status-diverifikasi-teks': WARNA_GELAP.teksPeringatan,
  '--status-ditindaklanjuti-latar': WARNA_GELAP.latarInfo,
  '--status-ditindaklanjuti-teks': WARNA_GELAP.biruTerang,
  '--status-selesai-latar': WARNA_GELAP.latarSelesai,
  '--status-selesai-teks': WARNA_GELAP.teksSelesai,
  '--status-ditolak-latar': WARNA_GELAP.latarBahaya,
  '--status-ditolak-teks': WARNA_GELAP.bahaya
} as const

/**
 * Penyesuaian khusus area dashboard (dipasang di <body> oleh layout dashboard, sehingga
 * dialog/dropdown yang di-teleport ke body ikut terpengaruh). Di dashboard, `accent`
 * mengikuti makna shadcn (latar hover netral); warna emas dipakai lewat token `--emas`.
 */
export const VARIABEL_TEMA_DASHBOARD = {
  '--accent': WARNA.redam,
  '--accent-foreground': WARNA.biruTua
} as const

function jadikanGaya(variabel: Record<string, string>): string {
  return Object.entries(variabel).map(([nama, nilai]) => `${nama}: ${nilai}`).join('; ')
}

export function buatGayaTema(): string {
  return jadikanGaya(VARIABEL_TEMA)
}

export function buatGayaTemaDashboard(gelap = false): string {
  return jadikanGaya(gelap ? VARIABEL_TEMA_GELAP : VARIABEL_TEMA_DASHBOARD)
}
