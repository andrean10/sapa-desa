import { BATAS_FILE } from '~~/shared/config/batas-file'
import { TEKS_LAPORAN_PUBLIK } from '~~/shared/config/teks'

export async function kompresFoto(file: File): Promise<File> {
  if (!BATAS_FILE.foto.tipeDiizinkan.includes(file.type as typeof BATAS_FILE.foto.tipeDiizinkan[number])) throw new Error(TEKS_LAPORAN_PUBLIK.fotoDitolak)
  const gambar = await createImageBitmap(file)
  if (file.size <= BATAS_FILE.foto.ukuranMaksimumByte && Math.max(gambar.width, gambar.height) <= 1600) {
    gambar.close()
    return file
  }
  const skala = Math.min(1, 1600 / Math.max(gambar.width, gambar.height))
  const kanvas = document.createElement('canvas')
  kanvas.width = Math.round(gambar.width * skala)
  kanvas.height = Math.round(gambar.height * skala)
  const konteks = kanvas.getContext('2d')
  if (!konteks) { gambar.close(); throw new Error(TEKS_LAPORAN_PUBLIK.fotoDitolak) }
  konteks.drawImage(gambar, 0, 0, kanvas.width, kanvas.height)
  gambar.close()
  const tipeKompresi = file.type === 'image/png' ? 'image/webp' : file.type
  for (const kualitas of [0.88, 0.78, 0.68, 0.58, 0.48]) {
    const hasil = await new Promise<Blob | null>(resolve => kanvas.toBlob(resolve, tipeKompresi, kualitas))
    if (hasil && hasil.size <= BATAS_FILE.foto.ukuranMaksimumByte) return new File([hasil], file.name, { type: tipeKompresi, lastModified: Date.now() })
  }
  throw new Error(TEKS_LAPORAN_PUBLIK.fotoDitolak)
}
