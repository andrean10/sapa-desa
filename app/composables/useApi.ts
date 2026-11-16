/** Request server endpoints and forward the current UPT employee context. */
export function useApi() {
  const pegawaiId = useCookie<string | null>('sapa-bertugas-id', { path: '/', sameSite: 'lax' })

  return useRequestFetch().create({
    onRequest({ options }) {
      if (!pegawaiId.value) return
      const headers = new Headers(options.headers)
      headers.set('x-bertugas-id', pegawaiId.value)
      options.headers = headers
    }
  })
}
