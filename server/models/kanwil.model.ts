import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, TablesInsert } from '../../shared/types/database.types'

export async function ambilDashboardKanwil(client: SupabaseClient<Database>, mulai?: string, selesai?: string) {
  const parameter = { ...(mulai && { p_mulai: mulai }), ...(selesai && { p_selesai: selesai }) }
  const [ringkasan, perUpt, tren, pantauan] = await Promise.all([
    client.rpc('dashboard_kanwil_ringkasan', parameter),
    client.rpc('dashboard_kanwil_per_upt', parameter),
    client.rpc('dashboard_kanwil_tren', parameter),
    client.from('v_laporan_belum_ditanggapi').select('*').order('hari_kerja_berjalan', { ascending: false }).limit(5)
  ])
  return { ringkasan, perUpt, tren, pantauan }
}

export async function ambilStatusAdmin(client: SupabaseClient<Database>) {
  return client.rpc('dashboard_admin_status')
}

export async function simpanValidasiLokasiAdmin(client: SupabaseClient<Database>, aktif: boolean) {
  return client.from('pengaturan').update({ nilai: String(aktif) }).eq('kunci', 'validasi_lokasi_aktif').select('kunci').maybeSingle()
}

export async function ambilPeringkatKanwil(client: SupabaseClient<Database>, mulai?: string, selesai?: string, hanyaNonDbi = false) {
  const parameter = { ...(mulai && { p_mulai: mulai }), ...(selesai && { p_selesai: selesai }) }
  const [upt, kecamatan, desa] = await Promise.all([
    client.rpc('peringkat_upt', parameter),
    client.rpc('peringkat_kecamatan', parameter),
    client.rpc('peringkat_desa', { ...parameter, p_hanya_non_dbi: hanyaNonDbi })
  ])
  return { upt, kecamatan, desa }
}

export async function daftarPantauanKanwil(client: SupabaseClient<Database>, kantorId?: string) {
  let query = client.from('v_laporan_belum_ditanggapi').select('*').order('hari_kerja_berjalan', { ascending: false })
  if (kantorId) query = query.eq('kantor_id', kantorId)
  return await query
}

export async function daftarKantorKanwil(client: SupabaseClient<Database>) {
  return await client.from('kantor_imigrasi').select('id, nama, nama_singkat').eq('aktif', true).order('nama')
}

export async function daftarLaporanKanwil(client: SupabaseClient<Database>, halaman: number, filter: {
  kantorId?: string
  status?: Database['public']['Enums']['status_laporan'][]
  jenis?: Database['public']['Enums']['jenis_terlapor']
  dari?: string
  sampai?: string
  cari?: string
  terlambat?: boolean
  belumDibaca?: boolean
} = {}) {
  let idsTerlambat: string[] | undefined
  if (filter.terlambat) {
    let terlambat = client.from('v_laporan_belum_ditanggapi').select('id')
    if (filter.kantorId) terlambat = terlambat.eq('kantor_id', filter.kantorId)
    const daftarTerlambat = await terlambat
    if (daftarTerlambat.error) return { ...daftarTerlambat, data: null, count: null }
    idsTerlambat = (daftarTerlambat.data ?? []).flatMap(item => item.id ? [item.id] : [])
    if (!idsTerlambat.length) return { data: [], count: 0, error: null }
  }
  let query = client.from('laporan').select('id, kode_pelacakan, status, jenis_terlapor, created_at, desa_kelurahan_id, kantor_id, laporan_dibaca!left(dibaca_pada)', { count: 'exact' }).order('created_at', { ascending: false }).range((halaman - 1) * 20, halaman * 20 - 1)
  if (filter.kantorId) query = query.eq('kantor_id', filter.kantorId)
  if (filter.status?.length) query = query.in('status', filter.status)
  if (filter.jenis) query = query.eq('jenis_terlapor', filter.jenis)
  if (filter.dari) query = query.gte('created_at', `${filter.dari}T00:00:00+07:00`)
  if (filter.sampai) query = query.lte('created_at', `${filter.sampai}T23:59:59.999+07:00`)
  if (idsTerlambat) query = query.in('id', idsTerlambat)
  if (filter.belumDibaca) query = query.is('laporan_dibaca', null)
  if (filter.cari) {
    const [desaCari, kecamatanCari] = await Promise.all([
      client.from('desa_kelurahan').select('id').ilike('nama', `%${filter.cari}%`),
      client.from('kecamatan').select('id').ilike('nama', `%${filter.cari}%`)
    ])
    if (desaCari.error || kecamatanCari.error) return { data: null, count: null, error: desaCari.error ?? kecamatanCari.error }
    const desaKecamatan = kecamatanCari.data?.length ? await client.from('desa_kelurahan').select('id').in('kecamatan_id', kecamatanCari.data.map(item => item.id)) : { data: [], error: null }
    if (desaKecamatan.error) return { data: null, count: null, error: desaKecamatan.error }
    const desaIds = [...new Set([...(desaCari.data ?? []).map(item => item.id), ...(desaKecamatan.data ?? []).map(item => item.id)])]
    query = query.or(`kode_pelacakan.ilike.%${filter.cari}%${desaIds.length ? `,desa_kelurahan_id.in.(${desaIds.join(',')})` : ''}`)
  }
  const hasil = await query
  if (hasil.error || !hasil.data?.length) return hasil
  const idsDesa = [...new Set(hasil.data.map(item => item.desa_kelurahan_id))]
  const idsKantor = [...new Set(hasil.data.map(item => item.kantor_id))]
  const [desa, kantor] = await Promise.all([
    client.from('desa_kelurahan').select('id, nama, kecamatan_id').in('id', idsDesa),
    client.from('kantor_imigrasi').select('id, nama_singkat').in('id', idsKantor)
  ])
  const kecamatan = desa.data?.length ? await client.from('kecamatan').select('id, nama, kabupaten_id').in('id', [...new Set(desa.data.map(item => item.kecamatan_id))]) : { data: [], error: null }
  const kabupaten = kecamatan.data?.length ? await client.from('kabupaten').select('id, nama').in('id', [...new Set(kecamatan.data.map(item => item.kabupaten_id))]) : { data: [], error: null }
  if (desa.error || kantor.error || kecamatan.error || kabupaten.error) return { ...hasil, error: desa.error ?? kantor.error ?? kecamatan.error ?? kabupaten.error }
  return { ...hasil, data: hasil.data.map(item => {
    const lokasiDesa = desa.data?.find(v => v.id === item.desa_kelurahan_id)
    const lokasiKecamatan = kecamatan.data?.find(v => v.id === lokasiDesa?.kecamatan_id)
    const { laporan_dibaca: dibaca, ...baris } = item
    return { ...baris, dibaca_pada: dibaca?.dibaca_pada ?? null, desa: lokasiDesa?.nama ?? 'Desa tidak tersedia', kecamatan: kabupaten.data?.find(v => v.id === lokasiKecamatan?.kabupaten_id)?.nama ?? 'Kabupaten/kota tidak tersedia', kantor: kantor.data?.find(v => v.id === item.kantor_id)?.nama_singkat ?? 'UPT tidak tersedia' }
  }) }
}

export async function daftarKegiatanKanwil(client: SupabaseClient<Database>, halaman: number, filter: {
  kantorId?: string; hanyaDiganti?: boolean; dari?: string; sampai?: string; desaId?: string; jenisId?: string; pegawaiId?: string
} = {}) {
  let query = client.from('laporan_pimpasa').select('id, tanggal_kegiatan, desa_id, pegawai_id, jenis_kegiatan_id, jumlah_peserta, uraian_hasil, foto_path, pdf_path, petugas_pengganti_nama, created_at, kantor_id', { count: 'exact' }).order('tanggal_kegiatan', { ascending: false }).range((halaman - 1) * 20, halaman * 20 - 1)
  if (filter.kantorId) query = query.eq('kantor_id', filter.kantorId)
  if (filter.hanyaDiganti) query = query.not('petugas_pengganti_nama', 'is', null)
  if (filter.dari) query = query.gte('tanggal_kegiatan', filter.dari)
  if (filter.sampai) query = query.lte('tanggal_kegiatan', filter.sampai)
  if (filter.desaId) query = query.eq('desa_id', filter.desaId)
  if (filter.jenisId) query = query.eq('jenis_kegiatan_id', filter.jenisId)
  if (filter.pegawaiId) query = query.eq('pegawai_id', filter.pegawaiId)
  const hasil = await query
  if (hasil.error || !hasil.data?.length) return hasil
  const [desa, pegawai, jenis, kantor] = await Promise.all([
    client.from('desa_kelurahan').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.desa_id))]),
    client.from('pegawai').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.pegawai_id))]),
    client.from('jenis_kegiatan').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.jenis_kegiatan_id))]),
    client.from('kantor_imigrasi').select('id, nama_singkat').in('id', [...new Set(hasil.data.map(item => item.kantor_id))])
  ])
  if (desa.error || pegawai.error || jenis.error || kantor.error) return { ...hasil, error: desa.error ?? pegawai.error ?? jenis.error ?? kantor.error }
  return { ...hasil, data: hasil.data.map(item => ({ ...item, desa: desa.data?.find(v => v.id === item.desa_id)?.nama ?? 'Desa tidak tersedia', pegawai: pegawai.data?.find(v => v.id === item.pegawai_id)?.nama ?? 'Pegawai tidak tersedia', jenis: jenis.data?.find(v => v.id === item.jenis_kegiatan_id)?.nama ?? 'Jenis tidak tersedia', kantor: kantor.data?.find(v => v.id === item.kantor_id)?.nama_singkat ?? 'UPT tidak tersedia' })) }
}

export async function pilihanFilterKegiatanKanwil(client: SupabaseClient<Database>) {
  const [desa, pegawai, jenis] = await Promise.all([
    client.from('desa_kelurahan').select('id, nama').order('nama'),
    client.from('pegawai').select('id, nama').order('nama'),
    client.from('jenis_kegiatan').select('id, nama').order('nama')
  ])
  return { desa, pegawai, jenis }
}

export async function daftarWilayahPilihanKanwil(client: SupabaseClient<Database>, kabupatenId?: string, kecamatanId?: string) {
  if (!kabupatenId) return { kabupaten: await client.from('kabupaten').select('id, nama, jenis').order('nama'), kecamatan: null, desa: null }
  const kecamatan = await client.from('kecamatan').select('id, nama').eq('kabupaten_id', kabupatenId).order('nama')
  if (!kecamatanId) return { kabupaten: null, kecamatan, desa: null }
  const desa = await client.from('desa_kelurahan').select('id, nama, jenis_wilayah, dbi').eq('kecamatan_id', kecamatanId).order('nama')
  return { kabupaten: null, kecamatan, desa }
}

export async function daftarDesaBinaanKanwil(client: SupabaseClient<Database>) {
  const desa = await client.from('desa_kelurahan').select('id, nama, kecamatan_id').eq('dbi', true).order('nama')
  if (desa.error || !desa.data?.length) return { data: [], error: desa.error }
  const [kecamatan, assignment] = await Promise.all([
    client.from('kecamatan').select('id, nama, kabupaten_id').in('id', [...new Set(desa.data.map(item => item.kecamatan_id))]),
    client.from('desa_binaan_pegawai').select('desa_id, pegawai_id, tanggal_mulai').in('desa_id', desa.data.map(item => item.id)).is('tanggal_selesai', null).order('tanggal_mulai', { ascending: false })
  ])
  const kabupatenIds = [...new Set((kecamatan.data ?? []).map(item => item.kabupaten_id))]
  const kabupaten = await client.from('kabupaten').select('id, nama, kantor_id').in('id', kabupatenIds)
  const kantorIds = [...new Set((kabupaten.data ?? []).map(item => item.kantor_id))]
  const pegawaiIds = [...new Set((assignment.data ?? []).map(item => item.pegawai_id))]
  const [kantor, pegawai, kegiatan] = await Promise.all([
    client.from('kantor_imigrasi').select('id, nama_singkat').in('id', kantorIds),
    client.from('pegawai').select('id, nama').in('id', pegawaiIds),
    client.from('laporan_pimpasa').select('desa_id, tanggal_kegiatan').in('desa_id', desa.data.map(item => item.id)).order('tanggal_kegiatan', { ascending: false })
  ])
  const error = kecamatan.error ?? assignment.error ?? kabupaten.error ?? kantor.error ?? pegawai.error ?? kegiatan.error
  if (error) return { data: [], error }
  return { data: desa.data.map(item => {
    const area = kecamatan.data?.find(value => value.id === item.kecamatan_id)
    const kab = kabupaten.data?.find(value => value.id === area?.kabupaten_id)
    const penugasan = (assignment.data ?? []).filter(value => value.desa_id === item.id)
    return {
      id: item.id, nama: item.nama, kecamatan: area?.nama ?? '—', kabupaten: kab?.nama ?? '—', kantor: kantor.data?.find(value => value.id === kab?.kantor_id)?.nama_singkat ?? '—',
      petugas: penugasan.map(value => pegawai.data?.find(person => person.id === value.pegawai_id)?.nama).filter((value): value is string => Boolean(value)),
      penugasanAktif: penugasan.length,
      kegiatanTerakhir: kegiatan.data?.find(value => value.desa_id === item.id)?.tanggal_kegiatan ?? null
    }
  }), error: null }
}

export async function ubahStatusDbiKanwil(client: SupabaseClient<Database>, desaId: string, dbi: boolean) {
  return dbi ? await client.rpc('tetapkan_dbi', { p_desa_id: desaId }) : await client.rpc('cabut_dbi', { p_desa_id: desaId })
}

export async function daftarPenugasanKanwil(client: SupabaseClient<Database>, aktif?: boolean, kantorId?: string, desaId?: string, pegawaiId?: string) {
  let query = client.from('desa_binaan_pegawai').select('id, desa_id, pegawai_id, kantor_id, tanggal_mulai, tanggal_selesai, alasan_berakhir').order('tanggal_mulai', { ascending: false })
  if (aktif === true) query = query.is('tanggal_selesai', null)
  if (aktif === false) query = query.not('tanggal_selesai', 'is', null)
  if (kantorId) query = query.eq('kantor_id', kantorId)
  if (desaId) query = query.eq('desa_id', desaId)
  if (pegawaiId) query = query.eq('pegawai_id', pegawaiId)
  const hasil = await query
  if (hasil.error || !hasil.data?.length) return { data: [], error: hasil.error }
  const [desa, pegawai, kantor] = await Promise.all([
    client.from('desa_kelurahan').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.desa_id))]),
    client.from('pegawai').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.pegawai_id))]),
    client.from('kantor_imigrasi').select('id, nama_singkat').in('id', [...new Set(hasil.data.map(item => item.kantor_id))])
  ])
  const error = desa.error ?? pegawai.error ?? kantor.error
  if (error) return { data: [], error }
  return { data: hasil.data.map(item => ({ ...item, desa: desa.data?.find(value => value.id === item.desa_id)?.nama ?? '—', pegawai: pegawai.data?.find(value => value.id === item.pegawai_id)?.nama ?? '—', kantor: kantor.data?.find(value => value.id === item.kantor_id)?.nama_singkat ?? '—' })), error: null }
}

export async function pilihanPenugasanKanwil(client: SupabaseClient<Database>) {
  const [desa, pegawai, kantor] = await Promise.all([
    client.from('desa_kelurahan').select('id, nama, kecamatan_id').eq('dbi', true).order('nama'),
    client.from('pegawai').select('id, nama, kantor_id').eq('aktif', true).order('nama'),
    client.from('kantor_imigrasi').select('id, nama_singkat').eq('aktif', true).order('nama_singkat')
  ])
  if (desa.error || pegawai.error || kantor.error) return { desa: [], pegawai: [], kantor: [], error: desa.error ?? pegawai.error ?? kantor.error }
  const kecamatan = desa.data.length ? await client.from('kecamatan').select('id, nama, kabupaten_id').in('id', [...new Set(desa.data.map(item => item.kecamatan_id))]) : { data: [], error: null }
  const kabupaten = kecamatan.data?.length ? await client.from('kabupaten').select('id, nama, kantor_id').in('id', [...new Set(kecamatan.data.map(item => item.kabupaten_id))]) : { data: [], error: null }
  if (kecamatan.error || kabupaten.error) return { desa: [], pegawai: [], kantor: [], error: kecamatan.error ?? kabupaten.error }
  return {
    desa: desa.data.map(item => {
      const area = kecamatan.data?.find(value => value.id === item.kecamatan_id)
      const kab = kabupaten.data?.find(value => value.id === area?.kabupaten_id)
      return { id: item.id, nama: item.nama, kecamatan: area?.nama ?? '—', kabupaten: kab?.nama ?? '—', kantor_id: kab?.kantor_id ?? '', kantor: kantor.data.find(value => value.id === kab?.kantor_id)?.nama_singkat ?? '—' }
    }),
    pegawai: pegawai.data.map(item => ({ ...item, kantor: kantor.data?.find(value => value.id === item.kantor_id)?.nama_singkat ?? '—' })),
    kantor: kantor.data,
    error: null
  }
}

export async function buatPenugasanKanwil(client: SupabaseClient<Database>, input: { desa_id: string; pegawai_id: string; tanggal_mulai?: string }) {
  return await client.from('desa_binaan_pegawai').insert(input as TablesInsert<'desa_binaan_pegawai'>).select('id').single()
}

export async function ubahPenugasanKanwil(client: SupabaseClient<Database>, id: string, input: { tanggal_mulai?: string; tanggal_selesai?: string | null; alasan_berakhir?: Database['public']['Enums']['alasan_berakhir_penugasan'] | null }) {
  return await client.from('desa_binaan_pegawai').update(input).eq('id', id).select('id').maybeSingle()
}

export async function daftarWilayahKerjaKanwil(client: SupabaseClient<Database>) {
  const [kabupaten, kantor, penugasan] = await Promise.all([
    client.from('kabupaten').select('id, nama, jenis, kantor_id').order('nama'),
    client.from('kantor_imigrasi').select('id, nama, nama_singkat').eq('aktif', true).order('nama'),
    client.from('desa_binaan_pegawai').select('desa_id').is('tanggal_selesai', null)
  ])
  if (kabupaten.error || kantor.error || penugasan.error) return { kabupaten: [], kantor: [], error: kabupaten.error ?? kantor.error ?? penugasan.error }
  const desaIds = [...new Set(penugasan.data.map(item => item.desa_id))]
  const desa = desaIds.length ? await client.from('desa_kelurahan').select('id, kecamatan_id').in('id', desaIds) : { data: [], error: null }
  const kecamatan = desa.data?.length ? await client.from('kecamatan').select('id, kabupaten_id').in('id', [...new Set(desa.data.map(item => item.kecamatan_id))]) : { data: [], error: null }
  const error = desa.error ?? kecamatan.error
  if (error) return { kabupaten: [], kantor: [], error }
  return { kabupaten: kabupaten.data.map(item => ({ ...item, kantor: kantor.data.find(value => value.id === item.kantor_id)?.nama_singkat ?? '—', jumlahPenugasanAktif: desa.data?.filter(value => kecamatan.data?.find(area => area.id === value.kecamatan_id)?.kabupaten_id === item.id).length ?? 0 })), kantor: kantor.data, error: null }
}

export async function ubahWilayahKanwil(client: SupabaseClient<Database>, kabupatenId: string, kantorId: string) {
  return await client.rpc('ubah_wilayah_kerja', { p_kabupaten_id: kabupatenId, p_kantor_id: kantorId })
}

export async function daftarFaqKanwil(client: SupabaseClient<Database>) {
  return await client.from('faq').select('id, pertanyaan, jawaban, urutan').order('urutan').order('created_at')
}

export async function tulisFaqKanwil(client: SupabaseClient<Database>, input: { id?: string; pertanyaan: string; jawaban: string; urutan: number }) {
  if (input.id) return await client.from('faq').update({ pertanyaan: input.pertanyaan, jawaban: input.jawaban, urutan: input.urutan }).eq('id', input.id).select('id').maybeSingle()
  return await client.from('faq').insert({ pertanyaan: input.pertanyaan, jawaban: input.jawaban, urutan: input.urutan }).select('id').single()
}

export async function hapusFaqKanwil(client: SupabaseClient<Database>, id: string) {
  return await client.from('faq').delete().eq('id', id).select('id').maybeSingle()
}

export async function ubahUrutanFaqKanwil(client: SupabaseClient<Database>, id: string, urutan: number) {
  return await client.from('faq').update({ urutan }).eq('id', id).select('id').maybeSingle()
}

export async function daftarPengaturanKanwil(client: SupabaseClient<Database>) {
  const [pengaturan, jenis] = await Promise.all([
    client.from('pengaturan').select('kunci, nilai, keterangan').in('kunci', ['batas_hari_tanggap', 'batas_menit_hapus_laporan', 'toleransi_batas_meter']).order('kunci'),
    client.from('jenis_kegiatan').select('id, nama, aktif').order('nama')
  ])
  return { pengaturan, jenis }
}

export async function simpanNilaiPengaturanKanwil(client: SupabaseClient<Database>, kunci: string, nilai: string) {
  return await client.from('pengaturan').update({ nilai }).eq('kunci', kunci).select('kunci').maybeSingle()
}

export async function tulisJenisKegiatanKanwil(client: SupabaseClient<Database>, input: { id?: string; nama: string; aktif?: boolean }) {
  if (input.id) return await client.from('jenis_kegiatan').update({ nama: input.nama, ...(input.aktif !== undefined && { aktif: input.aktif }) }).eq('id', input.id).select('id').maybeSingle()
  return await client.from('jenis_kegiatan').insert({ nama: input.nama, aktif: input.aktif ?? true }).select('id').single()
}
