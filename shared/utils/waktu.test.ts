import { describe, expect, it } from 'vitest'
import { formatRelatifWib, formatTanggalWaktuWib, formatTanggalWib, rentangPeriode, tanggalHariIniWib } from './waktu'

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

describe('rentang periode dan waktu relatif', () => {
  const kustom = { mulai: '2026-01-05', selesai: '2026-02-10' }

  it('menghitung bulan ini, bulan lalu (lintas tahun), tahun ini, 6 bulan, dan kustom', () => {
    expect(rentangPeriode('bulan_ini', kustom, '2026-11-17')).toEqual({ mulai: '2026-11-01', selesai: '2026-11-17' })
    expect(rentangPeriode('bulan_lalu', kustom, '2026-01-09')).toEqual({ mulai: '2025-12-01', selesai: '2025-12-31' })
    expect(rentangPeriode('bulan_lalu', kustom, '2026-03-30')).toEqual({ mulai: '2026-02-01', selesai: '2026-02-28' })
    expect(rentangPeriode('tahun_ini', kustom, '2026-11-17')).toEqual({ mulai: '2026-01-01', selesai: '2026-11-17' })
    expect(rentangPeriode('enam_bulan', kustom, '2026-11-17')).toEqual({ mulai: '2026-06-01', selesai: '2026-11-17' })
    expect(rentangPeriode('kustom', kustom, '2026-11-17')).toEqual(kustom)
  })

  it('memformat waktu relatif berdasarkan hari WIB', () => {
    const sekarang = new Date('2026-11-17T05:00:00Z') // 12.00 WIB
    expect(formatRelatifWib('2026-11-17T04:59:40Z', sekarang)).toBe('Baru saja')
    expect(formatRelatifWib('2026-11-17T04:20:00Z', sekarang)).toBe('40 menit lalu')
    expect(formatRelatifWib('2026-11-17T01:00:00Z', sekarang)).toBe('4 jam lalu')
    expect(formatRelatifWib('2026-11-16T17:30:00Z', sekarang)).toBe('11 jam lalu')
    expect(formatRelatifWib('2026-11-16T10:00:00Z', sekarang)).toBe('Kemarin')
    expect(formatRelatifWib('2026-11-14T10:00:00Z', sekarang)).toBe('3 hari lalu')
    expect(formatRelatifWib('2026-08-10T10:00:00Z', sekarang)).toBe('3 bulan lalu')
  })
})
