export function formatAngkaIndonesia(nilai: number): string {
  return new Intl.NumberFormat('id-ID').format(nilai)
}
