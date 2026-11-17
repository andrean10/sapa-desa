import { TIMEZONE } from '../config/app'

type BagianWaktu = Record<Intl.DateTimeFormatPartTypes, string>

function bagianTanggal(instant: Date): BagianWaktu {
  if (Number.isNaN(instant.getTime())) throw new RangeError('Tanggal tidak valid.')

  const bagian = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(instant)

  return Object.fromEntries(bagian.map(item => [item.type, item.value])) as BagianWaktu
}

function jadikanTanggal(nilai: Date | string): Date {
  return nilai instanceof Date ? nilai : new Date(nilai)
}

export function formatTanggalWaktuWib(nilai: Date | string): string {
  const bagian = bagianTanggal(jadikanTanggal(nilai))
  return `${bagian.day} ${bagian.month} ${bagian.year}, ${bagian.hour}.${bagian.minute} WIB`
}

export function formatTanggalWib(nilai: Date | string): string {
  const bagian = bagianTanggal(jadikanTanggal(nilai))
  return `${bagian.day} ${bagian.month} ${bagian.year}`
}

export function tanggalHariIniWib(sekarang: Date = new Date()): string {
  bagianTanggal(sekarang)
  const bagianNumerik = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(sekarang)
  const nilai = Object.fromEntries(bagianNumerik.map(item => [item.type, item.value]))
  return `${nilai.year}-${nilai.month}-${nilai.day}`
}

/** Tanggal awal rentang "6 bulan" (bulan berjalan + 5 bulan sebelumnya), format YYYY-MM-DD, memakai kalender WIB. */
export function awalEnamBulanWib(hariIni: string = tanggalHariIniWib()): string {
  const tahun = Number(hariIni.slice(0, 4))
  const bulan = Number(hariIni.slice(5, 7))
  return new Date(Date.UTC(tahun, bulan - 6, 1)).toISOString().slice(0, 10)
}

/** Nama bulan singkat (mis. "Nov") untuk sumbu grafik; nilai berupa epoch milidetik. */
export function formatBulanSingkatWib(nilai: number): string {
  return new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: TIMEZONE }).format(new Date(nilai))
}
