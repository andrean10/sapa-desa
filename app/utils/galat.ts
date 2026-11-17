type GalatApi = { data?: { statusMessage?: string; message?: string } }

/**
 * Mengambil pesan error yang dikirim server (createError di Nitro) dari galat $fetch/useApi.
 * `error.message` bawaan ofetch berisi teks teknis seperti `[POST] "/api/...": 422 ...`
 * sehingga tidak boleh ditampilkan ke pengguna.
 */
export function pesanGalat(galat: unknown, cadangan: string): string {
  const data = (galat as GalatApi | null)?.data
  return data?.statusMessage || data?.message || cadangan
}
