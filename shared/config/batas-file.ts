export const BATAS_FILE = {
  foto: {
    ukuranMaksimumByte: 3 * 1024 * 1024,
    ukuranMaksimumPermintaanByte: 3 * 1024 * 1024 + 64 * 1024,
    /** Jumlah foto per laporan kegiatan PIMPASA (opsional, 0 sampai batas ini). Sama dengan check di database. */
    maksimumJumlahKegiatan: 3,
    tipeDiizinkan: ['image/jpeg', 'image/png', 'image/webp']
  },
  pdf: {
    ukuranMaksimumByte: 8 * 1024 * 1024,
    tipeDiizinkan: ['application/pdf']
  }
} as const
