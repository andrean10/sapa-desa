import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import type { Database, Enums, TablesInsert } from '../../shared/types/database.types'

export async function ambilDashboardUpt(client: SupabaseClient<Database>, mulai?: string, selesai?: string, kantorId?: string) {
  const parameterKantor = kantorId ? { p_kantor_id: kantorId } : {}
  const [ringkasan, tindakan, desa, tren] = await Promise.all([
    client.rpc('dashboard_upt_ringkasan', parameterKantor),
    client.rpc('dashboard_upt_perlu_tindakan', { ...parameterKantor, p_limit: 10 }),
    client.rpc('dashboard_upt_desa_binaan', parameterKantor),
    client.rpc('dashboard_upt_tren', { ...parameterKantor, ...(mulai && { p_mulai: mulai }), ...(selesai && { p_selesai: selesai }) })
  ])
  return { ringkasan, tindakan, desa, tren }
}

export async function ubahStatusLaporanUpt(client: SupabaseClient<Database>, input: {
  laporanId: string
  status: Enums<'status_laporan'>
  keterangan?: string
  pegawaiId?: string
}) {
  return await client.rpc('ubah_status_laporan', {
    p_laporan_id: input.laporanId,
    p_status: input.status,
    p_keterangan: input.keterangan,
    ...(input.pegawaiId && { p_pegawai_id: input.pegawaiId })
  })
}

export async function daftarLaporanUpt(client: SupabaseClient<Database>, halaman: number, filter: {
  status?: Database['public']['Enums']['status_laporan'][]
  terlambat?: boolean
  jenis?: Database['public']['Enums']['jenis_terlapor']
  dari?: string
  sampai?: string
  cari?: string
  urut?: 'asc' | 'desc'
} = {}) {
  let idsTerlambat: string[] | undefined
  if (filter.terlambat) {
    const hasilTerlambat = await client.from('v_laporan_belum_ditanggapi').select('id')
    if (hasilTerlambat.error) return { ...hasilTerlambat, data: null, count: null }
    idsTerlambat = (hasilTerlambat.data ?? []).flatMap(item => item.id ? [item.id] : [])
    if (!idsTerlambat.length) return { data: [], count: 0, error: null }
  }
  const awal = (halaman - 1) * 20
  let query = client.from('laporan')
    .select('id, kode_pelacakan, status, jenis_terlapor, created_at, desa_kelurahan_id', { count: 'exact' })
    .order('created_at', { ascending: filter.urut === 'asc' })
    .range(awal, awal + 19)
  if (filter.status?.length) query = query.in('status', filter.status)
  if (filter.jenis) query = query.eq('jenis_terlapor', filter.jenis)
  if (filter.dari) query = query.gte('created_at', `${filter.dari}T00:00:00+07:00`)
  if (filter.sampai) query = query.lte('created_at', `${filter.sampai}T23:59:59.999+07:00`)
  if (idsTerlambat) query = query.in('id', idsTerlambat)
  if (filter.cari) {
    const [desaCari, kecamatanCari] = await Promise.all([
      client.from('desa_kelurahan').select('id').ilike('nama', `%${filter.cari}%`),
      client.from('kecamatan').select('id').ilike('nama', `%${filter.cari}%`)
    ])
    if (desaCari.error || kecamatanCari.error) return { data: null, count: null, error: desaCari.error ?? kecamatanCari.error }
    const desaKecamatan = kecamatanCari.data?.length
      ? await client.from('desa_kelurahan').select('id').in('kecamatan_id', kecamatanCari.data.map(item => item.id))
      : { data: [], error: null }
    if (desaKecamatan.error) return { data: null, count: null, error: desaKecamatan.error }
    const desaIds = [...new Set([...(desaCari.data ?? []).map(item => item.id), ...(desaKecamatan.data ?? []).map(item => item.id)])]
    query = query.or(`kode_pelacakan.ilike.%${filter.cari}%${desaIds.length ? `,desa_kelurahan_id.in.(${desaIds.join(',')})` : ''}`)
  }
  const hasil = await query
  if (hasil.error || !hasil.data?.length) return hasil
  const desa = await client.from('desa_kelurahan').select('id, nama, kecamatan_id').in('id', [...new Set(hasil.data.map(item => item.desa_kelurahan_id))])
  if (desa.error) return { ...hasil, error: desa.error }
  const kecamatan = desa.data?.length
    ? await client.from('kecamatan').select('id, nama').in('id', [...new Set(desa.data.map(item => item.kecamatan_id))])
    : { data: [], error: null }
  if (kecamatan.error) return { ...hasil, error: kecamatan.error }
  return { ...hasil, data: hasil.data.map(item => ({
    ...item,
    desa: desa.data?.find(value => value.id === item.desa_kelurahan_id)?.nama ?? 'Desa tidak tersedia',
    kecamatan: desa.data?.map(value => ({ ...value, kecamatan: kecamatan.data?.find(k => k.id === value.kecamatan_id)?.nama })).find(value => value.id === item.desa_kelurahan_id)?.kecamatan ?? 'Kecamatan tidak tersedia'
  })) }
}

export async function detailLaporanUpt(client: SupabaseClient<Database>, laporanId: string) {
  const [laporan, riwayat] = await Promise.all([
    client.from('laporan').select('*').eq('id', laporanId).maybeSingle(),
    client.from('riwayat_status').select('id, status, keterangan, created_at, pegawai_id').eq('laporan_id', laporanId).order('created_at')
  ])
  if (laporan.error || !laporan.data) return { laporan, riwayat, desa: null, kecamatan: null, kabupaten: null, kantor: null, pegawai: { data: [], error: null } }
  const [desa, kantor, pegawai, laporanSebelumnya] = await Promise.all([
    client.from('desa_kelurahan').select('nama, kecamatan_id').eq('id', laporan.data.desa_kelurahan_id).maybeSingle(),
    client.from('kantor_imigrasi').select('nama').eq('id', laporan.data.kantor_id).maybeSingle(),
    riwayat.data?.some(item => item.pegawai_id)
      ? client.from('pegawai').select('id, nama').in('id', [...new Set(riwayat.data.flatMap(item => item.pegawai_id ? [item.pegawai_id] : []))])
      : Promise.resolve({ data: [], error: null }),
    laporan.data.laporan_sebelumnya_id
      ? client.from('laporan').select('id, kode_pelacakan').eq('id', laporan.data.laporan_sebelumnya_id).maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ])
  const kecamatan = desa.data
    ? await client.from('kecamatan').select('nama, kabupaten_id').eq('id', desa.data.kecamatan_id).maybeSingle()
    : { data: null, error: null }
  const kabupaten = kecamatan.data
    ? await client.from('kabupaten').select('nama').eq('id', kecamatan.data.kabupaten_id).maybeSingle()
    : { data: null, error: null }
  return { laporan, riwayat, desa, kecamatan, kabupaten, kantor, pegawai, laporanSebelumnya }
}

/** Dipanggil hanya setelah query laporan terverifikasi dengan sesi user dan RLS. */
export async function buatSignedUrlFotoLaporan(path: string) {
  const config = useRuntimeConfig()
  const service = createClient<Database>(config.public.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  return await service.storage.from('foto-laporan').createSignedUrl(path, 300)
}

export async function buatSignedUrlLampiranUpt(bucket: 'foto-kegiatan' | 'laporan-pdf', path: string, kantorId: string) {
  if (!path.startsWith(`${kantorId}/`)) return { data: null, error: new Error('Path lampiran bukan milik kantor.') }
  const config = useRuntimeConfig()
  const service = createClient<Database>(config.public.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  return await service.storage.from(bucket).createSignedUrl(path, 300)
}

export async function daftarPegawaiUpt(client: SupabaseClient<Database>) {
  const hasil = await client.from('pegawai').select('id, nama, nip, aktif').order('nama')
  if (hasil.error || !hasil.data?.length) return hasil
  const penugasan = await client.from('desa_binaan_pegawai').select('pegawai_id, desa_id').in('pegawai_id', hasil.data.map(item => item.id)).is('tanggal_selesai', null)
  if (penugasan.error) return { ...hasil, error: penugasan.error }
  const desa = penugasan.data?.length
    ? await client.from('desa_kelurahan').select('id, nama').in('id', [...new Set(penugasan.data.map(item => item.desa_id))])
    : { data: [], error: null }
  if (desa.error) return { ...hasil, error: desa.error }
  return { ...hasil, data: hasil.data.map(item => ({ ...item, desa_binaan: (penugasan.data ?? []).filter(p => p.pegawai_id === item.id).flatMap(p => { const nama = desa.data?.find(value => value.id === p.desa_id)?.nama; return nama ? [nama] : [] }) })) }
}

export async function ambilDesaPenugasanAktif(client: SupabaseClient<Database>, pegawaiId: string) {
  const penugasan = await client.from('desa_binaan_pegawai').select('desa_id').eq('pegawai_id', pegawaiId).is('tanggal_selesai', null)
  if (penugasan.error || !penugasan.data?.length) return { data: [], error: penugasan.error }
  const desa = await client.from('desa_kelurahan').select('nama').in('id', [...new Set(penugasan.data.map(item => item.desa_id))])
  return { data: desa.data?.map(item => item.nama) ?? [], error: desa.error }
}

export async function tambahPegawaiUpt(client: SupabaseClient<Database>, nama: string, nip?: string) {
  return await client.from('pegawai').insert({ nama, nip: nip || null } as TablesInsert<'pegawai'>).select('id, nama, nip, aktif').single()
}

export async function ubahPegawaiUpt(client: SupabaseClient<Database>, id: string, perubahan: { nama?: string; nip?: string | null; aktif?: boolean }) {
  return await client.from('pegawai').update(perubahan).eq('id', id).select('id, nama, nip, aktif').maybeSingle()
}

export async function ambilProfilKantorUpt(client: SupabaseClient<Database>, kantorId: string) {
  const [kantor, kabupaten, penugasan] = await Promise.all([
    client.from('kantor_imigrasi').select('id, nama, nama_singkat').eq('id', kantorId).maybeSingle(),
    client.from('kabupaten').select('id, nama, jenis').eq('kantor_id', kantorId).order('nama'),
    client.from('desa_binaan_pegawai').select('pegawai_id, desa_id, tanggal_mulai').eq('kantor_id', kantorId).is('tanggal_selesai', null).order('tanggal_mulai', { ascending: false })
  ])
  return { kantor, kabupaten, penugasan }
}

export async function ambilNamaPenugasanUpt(client: SupabaseClient<Database>, pegawaiIds: string[], desaIds: string[]) {
  const [pegawai, desa] = await Promise.all([
    pegawaiIds.length ? client.from('pegawai').select('id, nama').in('id', pegawaiIds) : Promise.resolve({ data: [], error: null }),
    desaIds.length ? client.from('desa_kelurahan').select('id, nama, kecamatan_id').in('id', desaIds) : Promise.resolve({ data: [], error: null })
  ])
  const kecamatan = desa.data?.length
    ? await client.from('kecamatan').select('id, nama, kabupaten_id').in('id', [...new Set(desa.data.map(item => item.kecamatan_id))])
    : { data: [], error: null }
  const kabupaten = kecamatan.data?.length
    ? await client.from('kabupaten').select('id, nama').in('id', [...new Set(kecamatan.data.map(item => item.kabupaten_id))])
    : { data: [], error: null }
  return {
    pegawai,
    desa: { ...desa, error: desa.error ?? kecamatan.error ?? kabupaten.error, data: desa.data?.map(item => ({
      ...item,
      kecamatan: kecamatan.data?.find(value => value.id === item.kecamatan_id)?.nama ?? 'Kecamatan tidak tersedia',
      kabupaten: kabupaten.data?.find(value => value.id === kecamatan.data?.find(value => value.id === item.kecamatan_id)?.kabupaten_id)?.nama ?? 'Kabupaten/kota tidak tersedia'
    })) ?? [] }
  }
}

export async function daftarKegiatanUpt(client: SupabaseClient<Database>) {
  const hasil = await client.from('laporan_pimpasa')
    .select('id, tanggal_kegiatan, desa_id, pegawai_id, jenis_kegiatan_id, jumlah_peserta, uraian_hasil, foto_path, pdf_path, petugas_pengganti, created_at')
    .order('tanggal_kegiatan', { ascending: false })
  const pengaturan = await client.from('pengaturan').select('nilai').eq('kunci', 'batas_menit_hapus_laporan').maybeSingle()
  if (hasil.error || pengaturan.error) return { data: null, error: hasil.error ?? pengaturan.error }
  const batasMenitHapus = Number.parseInt(pengaturan.data?.nilai ?? '10', 10)
  if (!hasil.data?.length) return { data: [], error: null, batasMenitHapus: Number.isInteger(batasMenitHapus) ? batasMenitHapus : 10 }
  const [desa, pegawai, jenis] = await Promise.all([
    client.from('desa_kelurahan').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.desa_id))]),
    client.from('pegawai').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.pegawai_id))]),
    client.from('jenis_kegiatan').select('id, nama').in('id', [...new Set(hasil.data.map(item => item.jenis_kegiatan_id))])
  ])
  if (desa.error) return { ...hasil, error: desa.error, batasMenitHapus }
  if (pegawai.error) return { ...hasil, error: pegawai.error, batasMenitHapus }
  if (jenis.error) return { ...hasil, error: jenis.error, batasMenitHapus }
  return { ...hasil, batasMenitHapus: Number.isInteger(batasMenitHapus) ? batasMenitHapus : 10, data: hasil.data.map(item => ({
    ...item,
    desa: desa.data?.find(value => value.id === item.desa_id)?.nama ?? 'Desa tidak tersedia',
    pegawai: pegawai.data?.find(value => value.id === item.pegawai_id)?.nama ?? 'Pegawai tidak tersedia',
    jenis: jenis.data?.find(value => value.id === item.jenis_kegiatan_id)?.nama ?? 'Jenis tidak tersedia'
  })) }
}

export async function opsiKegiatanUpt(client: SupabaseClient<Database>, kantorId: string) {
  const [desa, pegawai, jenis, penugasan] = await Promise.all([
    client.rpc('dashboard_upt_desa_binaan'),
    client.from('pegawai').select('id, nama').eq('aktif', true).order('nama'),
    client.from('jenis_kegiatan').select('id, nama').eq('aktif', true).order('nama'),
    client.from('desa_binaan_pegawai').select('pegawai_id, desa_id, tanggal_mulai, tanggal_selesai').eq('kantor_id', kantorId)
  ])
  return { desa, pegawai, jenis, penugasan }
}

export async function tambahKegiatanUpt(client: SupabaseClient<Database>, data: {
  tanggal_kegiatan: string; desa_id: string; pegawai_id: string; jenis_kegiatan_id: string; jumlah_peserta: number; uraian_hasil: string
}) {
  return await client.from('laporan_pimpasa').insert(data as TablesInsert<'laporan_pimpasa'>).select('id').single()
}

export async function detailKegiatanUpt(client: SupabaseClient<Database>, id: string) {
  return await client.from('laporan_pimpasa').select('id, tanggal_kegiatan, desa_id, pegawai_id, jenis_kegiatan_id, jumlah_peserta, uraian_hasil, foto_path, pdf_path, petugas_pengganti, kantor_id')
    .eq('id', id).maybeSingle()
}

export async function ubahKegiatanUpt(client: SupabaseClient<Database>, id: string, perubahan: {
  tanggal_kegiatan: string; pegawai_id: string; jenis_kegiatan_id: string; jumlah_peserta: number; uraian_hasil: string; foto_path?: string; pdf_path?: string
}) {
  return await client.from('laporan_pimpasa').update(perubahan).eq('id', id).select('id').maybeSingle()
}

export async function hapusKegiatanUpt(client: SupabaseClient<Database>, id: string) {
  const hasil = await client.from('laporan_pimpasa').delete().eq('id', id).select('foto_path, pdf_path').maybeSingle()
  if (!hasil.data || hasil.error) return hasil
  const config = useRuntimeConfig()
  const service = createClient<Database>(config.public.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const cleanup = await Promise.all([
    hasil.data.foto_path ? service.storage.from('foto-kegiatan').remove([hasil.data.foto_path]) : Promise.resolve({ error: null }),
    hasil.data.pdf_path ? service.storage.from('laporan-pdf').remove([hasil.data.pdf_path]) : Promise.resolve({ error: null })
  ])
  return { ...hasil, error: cleanup.find(item => item.error)?.error ?? null }
}

export async function unggahLampiranKegiatanUpt(client: SupabaseClient<Database>, kantorId: string, bucket: 'foto-kegiatan' | 'laporan-pdf', file: Uint8Array, tipe: string) {
  const ekstensi = tipe === 'image/jpeg' ? 'jpg' : tipe === 'image/png' ? 'png' : tipe === 'image/webp' ? 'webp' : 'pdf'
  const path = `${kantorId}/${randomUUID()}.${ekstensi}`
  const hasil = await client.storage.from(bucket).upload(path, file, { contentType: tipe, upsert: false })
  return hasil.error ? { error: hasil.error } : { path }
}

export async function bersihkanLampiranKegiatan(pathFoto?: string | null, pathPdf?: string | null) {
  const config = useRuntimeConfig()
  const service = createClient<Database>(config.public.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const hasil = await Promise.all([
    pathFoto ? service.storage.from('foto-kegiatan').remove([pathFoto]) : Promise.resolve({ error: null }),
    pathPdf ? service.storage.from('laporan-pdf').remove([pathPdf]) : Promise.resolve({ error: null })
  ])
  return hasil.every(item => !item.error)
}
