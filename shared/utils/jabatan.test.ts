import { describe, expect, it } from 'vitest'
import { labelPemrosesAduan, namaUptUntukJabatan } from './jabatan'

describe('jabatan pemroses aduan', () => {
  it('mengambil nama UPT setelah TPI untuk ketujuh kantor', () => {
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas I TPI Pekanbaru')).toBe('PEKANBARU')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas I TPI Dumai')).toBe('DUMAI')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Rokan Hilir')).toBe('ROKAN HILIR')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Bengkalis')).toBe('BENGKALIS')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Siak')).toBe('SIAK')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Indragiri Hilir')).toBe('INDRAGIRI HILIR')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Kepulauan Meranti')).toBe('KEPULAUAN MERANTI')
  })

  it('tetap bekerja untuk nama tanpa TPI dan nama singkat', () => {
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas III Non TPI Siak')).toBe('SIAK')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas III Duri')).toBe('DURI')
    expect(namaUptUntukJabatan('Kanim Bengkalis')).toBe('BENGKALIS')
  })

  it('membentuk label jabatan lengkap', () => {
    expect(labelPemrosesAduan('Kantor Imigrasi Kelas II TPI Siak')).toBe('KASI INTELDAKIM SIAK')
    expect(labelPemrosesAduan(null)).toBe('KASI INTELDAKIM')
  })
})
