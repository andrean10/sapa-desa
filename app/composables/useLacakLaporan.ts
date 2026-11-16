import type { Enums } from '~~/shared/types/database.types'

export type HasilLacakLaporan = {
  kode_pelacakan: string
  status: Enums<'status_laporan'>
  kantor: string
  dikirim_pada: string
  timeline: { status: Enums<'status_laporan'>; keterangan: string | null; waktu: string }[]
}

export function useLacakLaporan() {
  async function lacak(kodePelacakan: string) {
    return await $fetch<HasilLacakLaporan>('/api/publik/laporan/lacak', {
      method: 'POST',
      body: { kode_pelacakan: kodePelacakan }
    })
  }

  return { lacak }
}
