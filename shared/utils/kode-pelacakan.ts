const KARAKTER_KODE = /[A-HJ-NP-Z2-9]/g

export function formatInputKodePelacakan(nilai: string): string {
  const hurufBesar = nilai.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const isi = (hurufBesar.startsWith('SD')
    ? hurufBesar.slice(2)
    : hurufBesar.startsWith('S')
      ? hurufBesar.slice(1)
      : hurufBesar)
    .match(KARAKTER_KODE)
    ?.join('')
    .slice(0, 8) ?? ''

  const bagianAwal = isi.slice(0, 4)
  const bagianAkhir = isi.slice(4)
  return `SD-${bagianAwal}${bagianAkhir ? `-${bagianAkhir}` : ''}`
}
