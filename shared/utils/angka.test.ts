import { describe, expect, it } from 'vitest'
import { formatAngkaIndonesia } from './angka'

describe('formatAngkaIndonesia', () => {
  it('memformat pemisah ribuan dalam format Indonesia', () => {
    expect(formatAngkaIndonesia(1862)).toBe('1.862')
  })
})
