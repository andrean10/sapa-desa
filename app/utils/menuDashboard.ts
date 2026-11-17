import type { PeranAplikasi } from '~~/shared/config/app'
import { MENU_PERAN } from '~~/shared/config/app'

export type ItemMenu = { label: string; href: string }
export type GrupMenu = { label: string; items: ItemMenu[] }

// Menu yang bersifat memantau/operasional harian; sisanya masuk kelompok "Pengelolaan".
const HREF_PEMANTAUAN = ['/upt', '/upt/laporan', '/upt/kegiatan', '/kanwil', '/kanwil/peringkat', '/kanwil/pantauan', '/kanwil/laporan', '/kanwil/kegiatan']
const HREF_BERANDA = ['/upt', '/kanwil']

export function kelompokMenu(peran: PeranAplikasi): GrupMenu[] {
  const semua = MENU_PERAN[peran]
  const utama = semua.filter(item => !item.href.startsWith('/admin'))
  const grup: GrupMenu[] = [
    { label: peran === 'upt' ? 'Operasional' : 'Pemantauan', items: utama.filter(item => HREF_PEMANTAUAN.includes(item.href)) },
    { label: peran === 'upt' ? 'Kantor' : 'Pengelolaan', items: utama.filter(item => !HREF_PEMANTAUAN.includes(item.href)) },
    { label: 'Admin', items: semua.filter(item => item.href.startsWith('/admin')) }
  ]
  return grup.filter(item => item.items.length)
}

export function menuCocok(path: string, href: string): boolean {
  return path === href || (!HREF_BERANDA.includes(href) && path.startsWith(`${href}/`))
}

/** Menu dan kelompok yang membawahi rute aktif (dipakai remah roti). */
export function cariMenuAktif(path: string, peran: PeranAplikasi): { grup: GrupMenu; item: ItemMenu } | null {
  for (const grup of kelompokMenu(peran)) {
    const item = grup.items.find(menu => menuCocok(path, menu.href))
    if (item) return { grup, item }
  }
  return null
}
