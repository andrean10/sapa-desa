export type HasilKirimLaporan = { kode_pelacakan: string }

export function useLaporan() {
  async function kirimLaporan(form: FormData) {
    return await $fetch<HasilKirimLaporan>('/api/publik/laporan', {
      method: 'POST',
      body: form
    })
  }

  return { kirimLaporan }
}
