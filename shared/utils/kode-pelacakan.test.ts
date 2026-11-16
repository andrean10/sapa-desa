import { describe, expect, it } from 'vitest'
import { formatInputKodePelacakan } from './kode-pelacakan'

describe('formatInputKodePelacakan', () => {
  it('menyisipkan prefix dan tanda hubung sambil mengetik', () => {
    expect(formatInputKodePelacakan('7kq2m9xp')).toBe('SD-7KQ2-M9XP')
  })

  it('menghapus spasi dan pemisah yang dimasukkan pengguna', () => {
    expect(formatInputKodePelacakan('sd 7kq2 - m9xp')).toBe('SD-7KQ2-M9XP')
  })

  it('membuang karakter yang tidak dapat muncul pada kode pelacakan', () => {
    expect(formatInputKodePelacakan('SD-1O7KQ2-M9XP')).toBe('SD-7KQ2-M9XP')
  })
})
