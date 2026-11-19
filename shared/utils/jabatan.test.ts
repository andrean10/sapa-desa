import { describe, expect, it } from 'vitest'
import { labelPemrosesAduan, namaUptUntukJabatan } from './jabatan'

describe('jabatan pemroses aduan', () => {
  it('mengambil nama UPT setelah TPI untuk ketujuh kantor', () => {
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas I TPI Pekanbaru')).toBe('Pekanbaru')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas I TPI Dumai')).toBe('Dumai')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Rokan Hilir')).toBe('Rokan Hilir')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Bengkalis')).toBe('Bengkalis')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Siak')).toBe('Siak')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Indragiri Hilir')).toBe('Indragiri Hilir')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas II TPI Kepulauan Meranti')).toBe('Kepulauan Meranti')
  })

  it('tetap bekerja untuk nama tanpa TPI dan nama singkat', () => {
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas III Non TPI Siak')).toBe('Siak')
    expect(namaUptUntukJabatan('Kantor Imigrasi Kelas III Duri')).toBe('Duri')
    expect(namaUptUntukJabatan('Kanim Bengkalis')).toBe('Bengkalis')
  })

  it('membentuk label jabatan lengkap', () => {
    expect(labelPemrosesAduan('Kantor Imigrasi Kelas II TPI Siak')).toBe('Humas Imigrasi Siak')
    expect(labelPemrosesAduan(null)).toBe('Humas Imigrasi')
  })
})
