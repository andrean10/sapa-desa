export type TipeFoto = 'image/jpeg' | 'image/png' | 'image/webp'

function cocok(data: Uint8Array, offset: number, tanda: number[]) {
  return tanda.every((byte, i) => data[offset + i] === byte)
}

/**
 * Menentukan tipe gambar dari byte awal file (magic bytes), bukan dari header Content-Type
 * yang dikirim klien dan bisa dipalsukan. Mengembalikan null bila bukan JPEG/PNG/WebP.
 */
export function deteksiTipeFoto(data: Uint8Array): TipeFoto | null {
  if (data.length < 12) return null
  if (cocok(data, 0, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (cocok(data, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  // WebP = "RIFF" <4 byte ukuran> "WEBP"
  if (cocok(data, 0, [0x52, 0x49, 0x46, 0x46]) && cocok(data, 8, [0x57, 0x45, 0x42, 0x50])) return 'image/webp'
  return null
}
