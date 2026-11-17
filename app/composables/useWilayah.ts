import type { Tables } from '~~/shared/types/database.types'

type KabupatenPublik = Pick<Tables<'kabupaten'>, 'id' | 'nama' | 'jenis' | 'kantor_id'>
type KecamatanPublik = Pick<Tables<'kecamatan'>, 'id' | 'nama'>
type DesaPublik = Pick<Tables<'desa_kelurahan'>, 'id' | 'nama' | 'jenis_wilayah'>

export function useWilayah() {
  const kabupaten = useFetch<KabupatenPublik[]>('/api/publik/wilayah', {
    key: 'publik-wilayah-kabupaten',
    default: () => []
  })

  // Pakai useAsyncData + guard (bukan useFetch + watch): saat induk dikosongkan (mis. kabupaten direset),
  // useFetch tetap memanggil API dengan parameter kosong dan menghasilkan error 400 / data yang salah.
  function kecamatan(kabupatenId: MaybeRefOrGetter<string | undefined>) {
    return useAsyncData<KecamatanPublik[]>('publik-wilayah-kecamatan', () => {
      const id = toValue(kabupatenId)
      return id ? $fetch<KecamatanPublik[]>('/api/publik/wilayah', { query: { kabupaten_id: id } }) : Promise.resolve([])
    }, { watch: [() => toValue(kabupatenId)], default: () => [] })
  }

  function desa(kecamatanId: MaybeRefOrGetter<string | undefined>) {
    return useAsyncData<DesaPublik[]>('publik-wilayah-desa', () => {
      const id = toValue(kecamatanId)
      return id ? $fetch<DesaPublik[]>('/api/publik/wilayah', { query: { kecamatan_id: id } }) : Promise.resolve([])
    }, { watch: [() => toValue(kecamatanId)], default: () => [] })
  }

  function kantor(kantorId: MaybeRefOrGetter<string | undefined>) {
    return useAsyncData<{ id: string; nama: string } | null>('publik-kantor', () => {
      const id = toValue(kantorId)
      return id ? $fetch<{ id: string; nama: string } | null>(`/api/publik/kantor/${encodeURIComponent(id)}`) : Promise.resolve(null)
    }, { watch: [() => toValue(kantorId)], default: () => null })
  }

  return { kabupaten, kecamatan, desa, kantor }
}
