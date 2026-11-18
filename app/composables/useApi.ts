import type { FetchOptions } from 'ofetch'

/** Request ke endpoint server dengan cookie sesi; galat 401/403 membatalkan cache profil di browser. */
export function useApi() {
  const profilDimuatPada = useState<number>('profil-dimuat-pada', () => 0)
  const requestFetch = useRequestFetch() as <T>(url: string, options?: FetchOptions) => Promise<T>

  return function api<T>(url: string, options: FetchOptions = {}) {
    return requestFetch<T>(url, {
      ...options,
      // Sesi/peran ditolak server: paksa middleware memverifikasi ulang profil pada navigasi berikutnya.
      onResponseError: (konteks) => { if (konteks.response.status === 401 || konteks.response.status === 403) profilDimuatPada.value = 0 }
    })
  }
}
