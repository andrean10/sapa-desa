/**
 * Merapikan ketikan kode pelacakan: huruf besar, tanpa spasi/pemisah, maksimal 6 karakter.
 * Pola: 3 huruf (huruf pertama = kode UPT) lalu 3 digit, mis. PZA512. Karakter yang tidak sesuai posisinya dibuang.
 */
export function formatInputKodePelacakan(nilai: string): string {
  const bersih = nilai.toUpperCase().replace(/[^A-Z0-9]/g, '')
  let hasil = ''
  for (const karakter of bersih) {
    const huruf = hasil.length < 3
    if (huruf ? /[A-Z]/.test(karakter) : /\d/.test(karakter)) hasil += karakter
    if (hasil.length === 6) break
  }
  return hasil
}
