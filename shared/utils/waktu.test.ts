import { describe, expect, it } from 'vitest'
import { formatTanggalWaktuWib, formatTanggalWib, tanggalHariIniWib } from './waktu'

describe('utilitas waktu WIB', () => {
  const instant = '2026-11-16T07:30:00.000Z'

  it('memformat tanggal dan jam ke format WIB yang ditetapkan', () => {
    expect(formatTanggalWaktuWib(instant)).toBe('16 Nov 2026, 14.30 WIB')
  })

  it('memformat tanggal tanpa jam', () => {
    expect(formatTanggalWib(instant)).toBe('16 Nov 2026')
  })

  it('menghasilkan hari ini berdasarkan zona WIB, termasuk lintas tengah malam UTC', () => {
    expect(tanggalHariIniWib(new Date('2026-11-15T17:30:00.000Z'))).toBe('2026-11-16')
  })
})
