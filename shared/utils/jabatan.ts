import { JABATAN_PEMROSES_ADUAN } from '../config/teks'

/**
 * Nama UPT untuk jabatan: bagian nama kantor setelah "TPI" (mis. "Kantor Imigrasi Kelas II TPI Siak" -> "Siak").
 * Bila tidak memuat "TPI", dipakai nama setelah awalan "Kantor Imigrasi Kelas ..." atau "Kanim".
 */
export function namaUptUntukJabatan(namaKantor: string): string {
  const nama = namaKantor.trim()
  const setelahTpi = nama.match(/\bTPI\s+(.+)$/i)?.[1]
  const sisa = setelahTpi
    ?? nama.replace(/^kantor\s+imigrasi\s+kelas\s+[ivx]+\s+/i, '').replace(/^kanim\s+/i, '')
  return sisa.trim()
}

/** Teks "diproses oleh" untuk perubahan status oleh UPT, mis. "Humas Imigrasi Siak". Sumber kebenaran tetap kolom riwayat_status.diproses_oleh. */
export function labelPemrosesAduan(namaKantor: string | null | undefined): string {
  if (!namaKantor) return JABATAN_PEMROSES_ADUAN
  return `${JABATAN_PEMROSES_ADUAN} ${namaUptUntukJabatan(namaKantor)}`
}
