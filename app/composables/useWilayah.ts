import type { Tables } from '~~/shared/types/database.types'

type KabupatenPublik = Pick<Tables<'kabupaten'>, 'id' | 'nama' | 'jenis' | 'kantor_id'>
type KecamatanPublik = Pick<Tables<'kecamatan'>, 'id' | 'nama'>
type DesaPublik = Pick<Tables<'desa_kelurahan'>, 'id' | 'nama' | 'jenis_wilayah'>

export function useWilayah() {
  const kabupaten = useFetch<KabupatenPublik[]>('/api/publik/wilayah', {
    key: 'publik-wilayah-kabupaten',
    default: () => []
  })

  function kecamatan(kabupatenId: MaybeRefOrGetter<string | undefined>) {
    return useFetch<KecamatanPublik[]>('/api/publik/wilayah', {
      key: `publik-wilayah-kecamatan-${toValue(kabupatenId) ?? 'kosong'}`,
      query: computed(() => ({ kabupaten_id: toValue(kabupatenId) })),
      immediate: Boolean(toValue(kabupatenId)),
      watch: [() => toValue(kabupatenId)],
      default: () => []
    })
  }

  function desa(kecamatanId: MaybeRefOrGetter<string | undefined>) {
    return useFetch<DesaPublik[]>('/api/publik/wilayah', {
      key: `publik-wilayah-desa-${toValue(kecamatanId) ?? 'kosong'}`,
      query: computed(() => ({ kecamatan_id: toValue(kecamatanId) })),
      immediate: Boolean(toValue(kecamatanId)),
      watch: [() => toValue(kecamatanId)],
      default: () => []
    })
  }

  function kantor(kantorId: MaybeRefOrGetter<string | undefined>) {
    return useFetch<{ id: string; nama: string } | null>(() => `/api/publik/kantor/${toValue(kantorId) ?? ''}`, {
      key: `publik-kantor-${toValue(kantorId) ?? 'kosong'}`,
      immediate: Boolean(toValue(kantorId)),
      watch: [() => toValue(kantorId)]
    })
  }

  return { kabupaten, kecamatan, desa, kantor }
}
