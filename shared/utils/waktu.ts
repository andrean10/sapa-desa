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
