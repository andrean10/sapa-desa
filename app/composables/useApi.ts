import type { FetchOptions } from 'ofetch'

/** Request server endpoints and forward the current UPT employee context. */
export function useApi() {
  const pegawaiId = useCookie<string | null>('sapa-bertugas-id', { path: '/', sameSite: 'lax' })
  const requestFetch = useRequestFetch() as <T>(url: string, options?: FetchOptions) => Promise<T>

  return function api<T>(url: string, options: FetchOptions = {}) {
    const headers = new Headers(options.headers)
    if (pegawaiId.value) headers.set('x-bertugas-id', pegawaiId.value)
    return requestFetch<T>(url, { ...options, headers })
  }
}
