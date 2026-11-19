import { describe, expect, it } from 'vitest'
import { formatInputKodePelacakan } from './kode-pelacakan'

describe('formatInputKodePelacakan', () => {
  it('menjadikan huruf besar dan membuang spasi serta pemisah', () => {
    expect(formatInputKodePelacakan('pza 512')).toBe('PZA512')
    expect(formatInputKodePelacakan('pza-512')).toBe('PZA512')
  })

  it('membuang karakter yang tidak sesuai posisinya', () => {
    expect(formatInputKodePelacakan('P1ZA5X12')).toBe('PZA512')
  })

  it('membatasi maksimal 6 karakter', () => {
    expect(formatInputKodePelacakan('PZA5129999')).toBe('PZA512')
  })

  it('mengembalikan kosong untuk masukan kosong', () => {
    expect(formatInputKodePelacakan('')).toBe('')
  })
})
