import { createError, getQuery, getRouterParam, readBody, type H3Event } from 'h3'
import { buatClientSesiUser } from '../utils/supabase'
import { profilSesi } from './auth.controller'
import { ambilDashboardKanwil, ambilPeringkatKanwil, ambilStatusAdmin, buatPenugasanKanwil, daftarDesaBinaanKanwil, daftarFaqKanwil, daftarKegiatanKanwil, daftarKantorKanwil, daftarLaporanKanwil, daftarPengaturanKanwil, daftarPantauanKanwil, daftarPenugasanKanwil, daftarWilayahKerjaKanwil, daftarWilayahPilihanKanwil, hapusFaqKanwil, pilihanFilterKegiatanKanwil, simpanNilaiPengaturanKanwil, simpanValidasiLokasiAdmin, tulisFaqKanwil, tulisJenisKegiatanKanwil, ubahPenugasanKanwil, ubahStatusDbiKanwil, ubahUrutanFaqKanwil, ubahWilayahKanwil } from '../models/kanwil.model'
import { tanggalHariIniWib } from '../../shared/utils/waktu'
import { z } from 'zod'
import { ambilDashboardUpt, ambilWaktuDibaca, buatSignedUrlFotoLaporan, buatSignedUrlLampiranUpt, detailKegiatanUpt, detailLaporanUpt, ubahStatusLaporanUpt } from '../models/upt.model'
import { daftarAkunAdmin, daftarKantorAdmin } from '../models/admin.model'
import type { Enums } from '../../shared/types/database.types'
import { JENIS_TERLAPOR, STATUS_LAPORAN } from '../../shared/config/teks'

export async function daftarLaporanKanwilController(event: H3Event) {
  await profilKanwil(event)
  const query = getQuery(event)
  const halaman = Number(query.halaman ?? 1)
  const kantorId = typeof query.kantorId === 'string' ? query.kantorId : undefined
  const statusRaw = query.status
  const status = Array.isArray(statusRaw) ? statusRaw : statusRaw === undefined ? [] : [statusRaw]
  const jenis = typeof query.jenis === 'string' && query.jenis ? query.jenis : undefined
  const dari = typeof query.dari === 'string' ? query.dari : undefined
  const sampai = typeof query.sampai === 'string' ? query.sampai : undefined
  const cariRaw = query.cari
  const terlambat = query.terlambat === 'true'
  if (!Number.isInteger(halaman) || halaman < 1 || (kantorId && !z.string().uuid().safeParse(kantorId).success) || status.some(value => typeof value !== 'string' || !STATUS_LAPORAN.some(item => item.value === value)) || (jenis && !JENIS_TERLAPOR.some(item => item.value === jenis)) || (dari && !/^\d{4}-\d{2}-\d{2}$/.test(dari)) || (sampai && !/^\d{4}-\d{2}-\d{2}$/.test(sampai)) || (query.terlambat !== undefined && query.terlambat !== 'true' && query.terlambat !== 'false') || (cariRaw !== undefined && typeof cariRaw !== 'string')) throw createError({ statusCode: 400, statusMessage: 'Filter laporan tidak valid.' })
  validasiPeriode(dari, sampai)
  if (dari && sampai && dari > sampai) throw createError({ statusCode: 400, statusMessage: 'Rentang tanggal tidak valid.' })
  const cari = typeof cariRaw === 'string' ? cariRaw.trim().replace(/[,%()]/g, '').slice(0, 100) : undefined
  const client = buatClientSesiUser(event)
  const [hasil, kantor] = await Promise.all([daftarLaporanKanwil(client, halaman, { kantorId, status: status as Enums<'status_laporan'>[], jenis: jenis as Enums<'jenis_terlapor'> | undefined, dari, sampai, cari, terlambat }), daftarKantorKanwil(client)])
  if (hasil.error || kantor.error) throw createError({ statusCode: 503, statusMessage: 'Daftar laporan belum dapat dimuat.' })
  const dibaca = await ambilWaktuDibaca(client, (hasil.data ?? []).map(item => item.id))
  if (dibaca.error) throw createError({ statusCode: 503, statusMessage: 'Daftar laporan belum dapat dimuat.' })
  const waktuDibaca = new Map((dibaca.data ?? []).map(item => [item.laporan_id, item.dibaca_pada]))
  return { data: (hasil.data ?? []).map(item => ({ ...item, dibaca_pada: waktuDibaca.get(item.id) ?? null })), total: hasil.count ?? 0, halaman, kantor: kantor.data ?? [] }
}

export async function dashboardUptLihatKanwil(event: H3Event) {
  await profilKanwil(event)
  const kantorId = getRouterParam(event, 'kantorId')
  if (!kantorId || !z.string().uuid().safeParse(kantorId).success) throw createError({ statusCode: 400, statusMessage: 'ID UPT tidak valid.' })
  const query = getQuery(event)
  const mulai = typeof query.mulai === 'string' ? query.mulai : undefined
  const selesai = typeof query.selesai === 'string' ? query.selesai : undefined
  validasiPeriode(mulai, selesai)
  const hasil = await ambilDashboardUpt(buatClientSesiUser(event), mulai, selesai, kantorId)
  if (hasil.ringkasan.error || hasil.tindakan.error || hasil.desa.error || hasil.tren.error) throw createError({ statusCode: 503, statusMessage: 'Dashboard UPT belum dapat dimuat.' })
  const kantor = await buatClientSesiUser(event).from('kantor_imigrasi').select('nama, nama_singkat').eq('id', kantorId).maybeSingle()
  if (kantor.error) throw createError({ statusCode: 503, statusMessage: 'Profil UPT belum dapat dimuat.' })
  if (!kantor.data) throw createError({ statusCode: 404, statusMessage: 'UPT tidak ditemukan.' })
  return { kantor: kantor.data, ringkasan: hasil.ringkasan.data?.[0] ?? null, tindakan: hasil.tindakan.data ?? [], desa: hasil.desa.data ?? [], tren: hasil.tren.data }
}

export async function simpanStatusLaporanAdmin(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Hanya admin yang dapat mengubah status laporan.' })
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID laporan tidak valid.' })
  const skema = z.object({ status: z.enum(['diverifikasi', 'ditindaklanjuti', 'selesai', 'ditolak']), keterangan: z.string().trim().max(1000).optional() }).strict()
  const input = skema.safeParse(await readBody(event))
  if (!input.success || (['selesai', 'ditolak'].includes(input.data.status) && !input.data.keterangan?.trim())) throw createError({ statusCode: 400, statusMessage: 'Periksa status dan keterangan. Keterangan wajib untuk status Selesai atau Ditolak.' })
  const hasil = await ubahStatusLaporanUpt(buatClientSesiUser(event), { laporanId: id, status: input.data.status as Enums<'status_laporan'>, keterangan: input.data.keterangan })
  if (hasil.error) {
    if (hasil.error.message.includes('tidak ditemukan')) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan.' })
    if (hasil.error.message.includes('Keterangan wajib')) throw createError({ statusCode: 400, statusMessage: hasil.error.message })
    throw createError({ statusCode: 422, statusMessage: hasil.error.message || 'Perubahan status tidak dapat dilakukan. Muat ulang laporan.' })
  }
  return { berhasil: true }
}

export async function detailLaporanKanwilController(event: H3Event) {
  await profilKanwil(event)
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID laporan tidak valid.' })
  const hasil = await detailLaporanUpt(buatClientSesiUser(event), id)
  if (hasil.laporan.error || hasil.riwayat.error || hasil.desa?.error || hasil.kecamatan?.error || hasil.kabupaten?.error || hasil.kantor?.error || hasil.pegawai.error || hasil.laporanSebelumnya?.error) throw createError({ statusCode: 503, statusMessage: 'Detail laporan belum dapat dimuat.' })
  if (!hasil.laporan.data) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan.' })
  const { foto_path, ...laporan } = hasil.laporan.data
  const foto = foto_path ? await buatSignedUrlFotoLaporan(foto_path) : null
  if (foto?.error) throw createError({ statusCode: 503, statusMessage: 'Foto laporan belum dapat dimuat.' })
  const dibaca = await ambilWaktuDibaca(buatClientSesiUser(event), [id])
  return { ...laporan, dibaca_pada: dibaca.data?.[0]?.dibaca_pada ?? null, foto_url: foto?.data.signedUrl ?? null, lokasi: { desa: hasil.desa?.data?.nama ?? null, kecamatan: hasil.kecamatan?.data?.nama ?? null, kabupaten: hasil.kabupaten?.data?.nama ?? null }, kantor: hasil.kantor?.data?.nama ?? null, laporan_sebelumnya: hasil.laporanSebelumnya?.data ?? null, riwayat_status: (hasil.riwayat.data ?? []).map(item => ({ ...item, nama_pegawai: hasil.pegawai.data?.find(p => p.id === item.pegawai_id)?.nama ?? null })) }
}

export async function daftarKegiatanKanwilController(event: H3Event) {
  await profilKanwil(event)
  const query = getQuery(event)
  const halaman = Number(query.halaman ?? 1)
  const kantorId = typeof query.kantorId === 'string' ? query.kantorId : undefined
  const hanyaDiganti = query.hanyaDiganti === 'true'
  const dari = typeof query.dari === 'string' ? query.dari : undefined
  const sampai = typeof query.sampai === 'string' ? query.sampai : undefined
  const desaId = typeof query.desaId === 'string' ? query.desaId : undefined
  const jenisId = typeof query.jenisId === 'string' ? query.jenisId : undefined
  const pegawaiId = typeof query.pegawaiId === 'string' ? query.pegawaiId : undefined
  if (!Number.isInteger(halaman) || halaman < 1 || (kantorId && !z.string().uuid().safeParse(kantorId).success) || (desaId && !z.string().min(1).safeParse(desaId).success) || (jenisId && !z.string().uuid().safeParse(jenisId).success) || (pegawaiId && !z.string().uuid().safeParse(pegawaiId).success)) throw createError({ statusCode: 400, statusMessage: 'Filter kegiatan tidak valid.' })
  validasiPeriode(dari, sampai)
  if (dari && sampai && dari > sampai) throw createError({ statusCode: 400, statusMessage: 'Rentang tanggal kegiatan tidak valid.' })
  const client = buatClientSesiUser(event)
  const [hasil, kantor, pilihan] = await Promise.all([daftarKegiatanKanwil(client, halaman, { kantorId, hanyaDiganti, dari, sampai, desaId, jenisId, pegawaiId }), daftarKantorKanwil(client), pilihanFilterKegiatanKanwil(client)])
  if (hasil.error || kantor.error || pilihan.desa.error || pilihan.pegawai.error || pilihan.jenis.error) throw createError({ statusCode: 503, statusMessage: 'Daftar kegiatan belum dapat dimuat.' })
  return { data: (hasil.data ?? []).map(({ foto_path, pdf_path, ...item }) => ({ ...item, ada_foto: Boolean(foto_path), ada_pdf: Boolean(pdf_path) })), total: hasil.count ?? 0, halaman, kantor: kantor.data ?? [], pilihan: { desa: pilihan.desa.data ?? [], pegawai: pilihan.pegawai.data ?? [], jenis: pilihan.jenis.data ?? [] } }
}

export async function detailKegiatanKanwilController(event: H3Event) {
  await profilKanwil(event)
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID kegiatan tidak valid.' })
  const hasil = await detailKegiatanUpt(buatClientSesiUser(event), id)
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Detail kegiatan belum dapat dimuat.' })
  if (!hasil.data) throw createError({ statusCode: 404, statusMessage: 'Laporan kegiatan tidak ditemukan.' })
  const [foto, pdf] = await Promise.all([
    hasil.data.foto_path ? buatSignedUrlLampiranUpt('foto-kegiatan', hasil.data.foto_path, hasil.data.kantor_id) : Promise.resolve({ data: null, error: null }),
    hasil.data.pdf_path ? buatSignedUrlLampiranUpt('laporan-pdf', hasil.data.pdf_path, hasil.data.kantor_id) : Promise.resolve({ data: null, error: null })
  ])
  if (foto.error || pdf.error) throw createError({ statusCode: 503, statusMessage: 'Lampiran kegiatan belum dapat dimuat.' })
  const kantor = await buatClientSesiUser(event).from('kantor_imigrasi').select('nama_singkat').eq('id', hasil.data.kantor_id).maybeSingle()
  const [desa, pegawai, jenis] = await Promise.all([
    buatClientSesiUser(event).from('desa_kelurahan').select('nama').eq('id', hasil.data.desa_id).maybeSingle(),
    buatClientSesiUser(event).from('pegawai').select('nama').eq('id', hasil.data.pegawai_id).maybeSingle(),
    buatClientSesiUser(event).from('jenis_kegiatan').select('nama').eq('id', hasil.data.jenis_kegiatan_id).maybeSingle()
  ])
  if (kantor.error || desa.error || pegawai.error || jenis.error) throw createError({ statusCode: 503, statusMessage: 'Rincian kegiatan belum dapat dimuat.' })
  const { foto_path, pdf_path, ...item } = hasil.data
  return { ...item, kantor: kantor.data?.nama_singkat ?? 'UPT tidak tersedia', desa: desa.data?.nama ?? 'Desa tidak tersedia', pegawai: pegawai.data?.nama ?? 'Pegawai tidak tersedia', jenis: jenis.data?.nama ?? 'Jenis tidak tersedia', foto_url: foto.data?.signedUrl ?? null, pdf_url: pdf.data?.signedUrl ?? null }
}

function validasiPeriode(mulai?: string, selesai?: string) {
  const tanggalValid = (nilai?: string) => {
    if (!nilai || !/^\d{4}-\d{2}-\d{2}$/.test(nilai)) return false
    const tanggal = new Date(`${nilai}T00:00:00Z`)
    return !Number.isNaN(tanggal.getTime()) && tanggal.toISOString().slice(0, 10) === nilai
  }
  if ((mulai && !tanggalValid(mulai)) || (selesai && !tanggalValid(selesai)) || (mulai && selesai && mulai > selesai) || (selesai && selesai > tanggalHariIniWib())) {
    throw createError({ statusCode: 400, statusMessage: 'Periode yang dipilih tidak valid.' })
  }
  if (mulai && selesai && new Date(`${selesai}T00:00:00Z`).getTime() - new Date(`${mulai}T00:00:00Z`).getTime() > 3660 * 86_400_000) {
    throw createError({ statusCode: 400, statusMessage: 'Rentang periode maksimal 10 tahun.' })
  }
}

async function profilKanwil(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'kanwil' && profil.peran !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Halaman ini hanya untuk Kanwil dan admin.' })
  return profil
}

export async function dashboardKanwil(event: H3Event) {
  await profilKanwil(event)
  const query = getQuery(event)
  const mulai = typeof query.mulai === 'string' ? query.mulai : undefined
  const selesai = typeof query.selesai === 'string' ? query.selesai : undefined
  validasiPeriode(mulai, selesai)
  const hasil = await ambilDashboardKanwil(buatClientSesiUser(event), mulai, selesai)
  if (hasil.ringkasan.error || hasil.perUpt.error || hasil.tren.error || hasil.pantauan.error) {
    throw createError({ statusCode: 503, statusMessage: 'Dashboard Kanwil belum dapat dimuat.' })
  }
  return {
    ringkasan: hasil.ringkasan.data?.[0] ?? null,
    perUpt: hasil.perUpt.data ?? [],
    tren: hasil.tren.data,
    pantauan: hasil.pantauan.data ?? []
  }
}

export async function statusAdmin(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Halaman ini hanya untuk admin.' })
  const hasil = await ambilStatusAdmin(buatClientSesiUser(event))
  if (hasil.error || !hasil.data?.[0]) throw createError({ statusCode: 503, statusMessage: 'Status sistem belum dapat dimuat.' })
  return hasil.data[0]
}

export async function ubahStatusLokasiAdmin(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Halaman ini hanya untuk admin.' })
  const input = z.object({ aktif: z.boolean() }).strict().safeParse(await readBody(event))
  if (!input.success) throw createError({ statusCode: 400, statusMessage: 'Status validasi lokasi tidak valid.' })
  const hasil = await simpanValidasiLokasiAdmin(buatClientSesiUser(event), input.data.aktif)
  if (hasil.error || !hasil.data) throw createError({ statusCode: 403, statusMessage: 'Perubahan status validasi lokasi ditolak.' })
  return { berhasil: true }
}

export async function listaAkunAdmin(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Halaman ini hanya untuk admin.' })
  const client = buatClientSesiUser(event)
  const [akun, kantor] = await Promise.all([daftarAkunAdmin(client), daftarKantorAdmin(client)])
  if (akun.error || kantor.error) throw createError({ statusCode: 503, statusMessage: 'Daftar akun belum dapat dimuat.' })
  return { akun: akun.data ?? [], kantor: kantor.data ?? [] }
}

export async function daftarKantorLihatKanwil(event: H3Event) {
  await profilKanwil(event)
  const hasil = await daftarKantorKanwil(buatClientSesiUser(event))
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Daftar UPT belum dapat dimuat.' })
  return hasil.data ?? []
}

export async function peringkatKanwil(event: H3Event) {
  await profilKanwil(event)
  const query = getQuery(event)
  const mulai = typeof query.mulai === 'string' ? query.mulai : undefined
  const selesai = typeof query.selesai === 'string' ? query.selesai : undefined
  const hanyaNonDbi = query.hanyaNonDbi === 'true'
  validasiPeriode(mulai, selesai)
  const hasil = await ambilPeringkatKanwil(buatClientSesiUser(event), mulai, selesai, hanyaNonDbi)
  if (hasil.upt.error || hasil.kecamatan.error || hasil.desa.error) throw createError({ statusCode: 503, statusMessage: 'Data peringkat belum dapat dimuat.' })
  return { upt: hasil.upt.data ?? [], kecamatan: hasil.kecamatan.data ?? [], desa: hasil.desa.data ?? [] }
}

export async function pantauanKanwil(event: H3Event) {
  await profilKanwil(event)
  const query = getQuery(event)
  const kantorId = typeof query.kantorId === 'string' && query.kantorId ? query.kantorId : undefined
  const client = buatClientSesiUser(event)
  const [pantauan, kantor, pengaturan] = await Promise.all([
    daftarPantauanKanwil(client, kantorId),
    daftarKantorKanwil(client),
    client.from('pengaturan').select('nilai').eq('kunci', 'batas_hari_tanggap').maybeSingle()
  ])
  if (pantauan.error || kantor.error || pengaturan.error) throw createError({ statusCode: 503, statusMessage: 'Pantauan laporan belum dapat dimuat.' })
  const dibaca = await ambilWaktuDibaca(client, (pantauan.data ?? []).flatMap(item => item.id ? [item.id] : []))
  if (dibaca.error) throw createError({ statusCode: 503, statusMessage: 'Pantauan laporan belum dapat dimuat.' })
  const waktuDibaca = new Map((dibaca.data ?? []).map(item => [item.laporan_id, item.dibaca_pada]))
  return { data: (pantauan.data ?? []).map(item => ({ ...item, dibaca_pada: item.id ? waktuDibaca.get(item.id) ?? null : null })), kantor: kantor.data ?? [], batasHari: Number(pengaturan.data?.nilai ?? 7) }
}

function pastikanBerhasil<T extends { error: { message: string } | null; data?: unknown }>(hasil: T, aksi: string) {
  if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message || `${aksi} belum berhasil.` })
  if ('data' in hasil && !hasil.data) throw createError({ statusCode: 404, statusMessage: 'Data tidak ditemukan atau perubahan ditolak oleh kebijakan akses.' })
}

export async function desaBinaanKanwil(event: H3Event) {
  await profilKanwil(event)
  const hasil = await daftarDesaBinaanKanwil(buatClientSesiUser(event))
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Daftar desa binaan belum dapat dimuat.' })
  return hasil.data
}

export async function pilihanWilayahKanwil(event: H3Event) {
  await profilKanwil(event)
  const query = getQuery(event)
  const kabupatenId = typeof query.kabupatenId === 'string' ? query.kabupatenId : undefined
  const kecamatanId = typeof query.kecamatanId === 'string' ? query.kecamatanId : undefined
  const hasil = await daftarWilayahPilihanKanwil(buatClientSesiUser(event), kabupatenId, kecamatanId)
  if (hasil.kabupaten?.error || hasil.kecamatan?.error || hasil.desa?.error) throw createError({ statusCode: 503, statusMessage: 'Pilihan wilayah belum dapat dimuat.' })
  return { kabupaten: hasil.kabupaten?.data ?? [], kecamatan: hasil.kecamatan?.data ?? [], desa: hasil.desa?.data ?? [] }
}

export async function ubahDbiKanwil(event: H3Event) {
  await profilKanwil(event)
  const parsed = z.object({ desa_id: z.string().min(1), dbi: z.boolean() }).strict().safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Desa yang dipilih tidak valid.' })
  const hasil = await ubahStatusDbiKanwil(buatClientSesiUser(event), parsed.data.desa_id, parsed.data.dbi)
  if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message })
  return { jumlahPenugasanDitutup: parsed.data.dbi ? 0 : hasil.data }
}

export async function penugasanKanwil(event: H3Event) {
  await profilKanwil(event)
  const query = getQuery(event)
  const aktif = query.aktif === 'true' ? true : query.aktif === 'false' ? false : undefined
  const kantorId = typeof query.kantorId === 'string' ? query.kantorId : undefined
  const desaId = typeof query.desaId === 'string' ? query.desaId : undefined
  const pegawaiId = typeof query.pegawaiId === 'string' ? query.pegawaiId : undefined
  const client = buatClientSesiUser(event)
  const [daftar, pilihan] = await Promise.all([daftarPenugasanKanwil(client, aktif, kantorId, desaId, pegawaiId), daftarKantorKanwil(client)])
  if (daftar.error || pilihan.error) throw createError({ statusCode: 503, statusMessage: 'Daftar penugasan belum dapat dimuat.' })
  return { data: daftar.data ?? [], kantor: pilihan.data ?? [] }
}

export async function pilihanPenugasanKanwil(event: H3Event) {
  await profilKanwil(event)
  const hasil = await import('../models/kanwil.model').then(mod => mod.pilihanPenugasanKanwil(buatClientSesiUser(event)))
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Pilihan penugasan belum dapat dimuat.' })
  return hasil
}

export async function buatPenugasanKanwilHandler(event: H3Event) {
  await profilKanwil(event)
  const parsed = z.object({ desa_id: z.string().min(1), pegawai_id: z.string().uuid(), tanggal_mulai: z.string().optional() }).strict().safeParse(await readBody(event))
  if (!parsed.success || parsed.data.tanggal_mulai && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.tanggal_mulai)) throw createError({ statusCode: 400, statusMessage: 'Isian penugasan tidak valid.' })
  const hasil = await buatPenugasanKanwil(buatClientSesiUser(event), parsed.data)
  if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message })
  return { id: hasil.data.id }
}

export async function ubahPenugasanKanwilHandler(event: H3Event) {
  await profilKanwil(event)
  const id = event.context.params?.id
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'ID penugasan tidak valid.' })
  const parsed = z.object({ tanggal_mulai: z.string().optional(), tanggal_selesai: z.string().nullable().optional(), alasan_berakhir: z.enum(['rotasi', 'mutasi', 'desa_dicabut', 'lainnya']).nullable().optional() }).strict().refine(input => input.tanggal_mulai !== undefined || input.tanggal_selesai !== undefined || input.alasan_berakhir !== undefined).safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Tanggal atau alasan penugasan tidak valid.' })
  const client = buatClientSesiUser(event)
  const hasil = await ubahPenugasanKanwil(client, id, parsed.data)
  pastikanBerhasil(hasil, 'Perubahan penugasan')
  return { berhasil: true }
}

export async function wilayahKerjaKanwil(event: H3Event) {
  await profilKanwil(event)
  const hasil = await daftarWilayahKerjaKanwil(buatClientSesiUser(event))
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Wilayah kerja belum dapat dimuat.' })
  return { kabupaten: hasil.kabupaten, kantor: hasil.kantor }
}

export async function ubahWilayahKanwilHandler(event: H3Event) {
  await profilKanwil(event)
  const parsed = z.object({ kabupaten_id: z.string().min(1), kantor_id: z.string().uuid() }).strict().safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Kabupaten/kota atau kantor tujuan tidak valid.' })
  const hasil = await ubahWilayahKanwil(buatClientSesiUser(event), parsed.data.kabupaten_id, parsed.data.kantor_id)
  if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message })
  return { jumlahPenugasanDitutup: hasil.data }
}

export async function faqKanwil(event: H3Event) {
  await profilKanwil(event)
  const hasil = await daftarFaqKanwil(buatClientSesiUser(event))
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Daftar FAQ belum dapat dimuat.' })
  return hasil.data ?? []
}

export async function simpanFaqKanwil(event: H3Event) {
  await profilKanwil(event)
  const parsed = z.object({ id: z.string().uuid().optional(), pertanyaan: z.string().trim().min(1).max(250), jawaban: z.string().trim().min(1).max(5000), urutan: z.number().int().min(0) }).strict().safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Pertanyaan, jawaban, atau urutan FAQ tidak valid.' })
  const hasil = await tulisFaqKanwil(buatClientSesiUser(event), parsed.data)
  pastikanBerhasil(hasil, 'Penyimpanan FAQ')
  return { berhasil: true }
}

export async function hapusFaqKanwilHandler(event: H3Event) {
  await profilKanwil(event)
  const id = event.context.params?.id
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID FAQ tidak valid.' })
  pastikanBerhasil(await hapusFaqKanwil(buatClientSesiUser(event), id), 'Penghapusan FAQ')
  return { berhasil: true }
}

export async function ubahUrutanFaqKanwilHandler(event: H3Event) {
  await profilKanwil(event)
  const id = event.context.params?.id
  const parsed = z.object({ urutan: z.number().int().min(0) }).strict().safeParse(await readBody(event))
  if (!id || !z.string().uuid().safeParse(id).success || !parsed.success) throw createError({ statusCode: 400, statusMessage: 'Urutan FAQ tidak valid.' })
  pastikanBerhasil(await ubahUrutanFaqKanwil(buatClientSesiUser(event), id, parsed.data.urutan), 'Pengurutan FAQ')
  return { berhasil: true }
}

export async function pengaturanKanwil(event: H3Event) {
  await profilKanwil(event)
  const hasil = await daftarPengaturanKanwil(buatClientSesiUser(event))
  if (hasil.pengaturan.error || hasil.jenis.error) throw createError({ statusCode: 503, statusMessage: 'Pengaturan belum dapat dimuat.' })
  return { pengaturan: hasil.pengaturan.data ?? [], jenis: hasil.jenis.data ?? [] }
}

export async function simpanNilaiPengaturanKanwilHandler(event: H3Event) {
  await profilKanwil(event)
  const parsed = z.object({ kunci: z.enum(['batas_hari_tanggap', 'batas_menit_hapus_laporan', 'toleransi_batas_meter']), nilai: z.coerce.number().int().min(0).max(99999) }).strict().safeParse(await readBody(event))
  if (!parsed.success || parsed.success && parsed.data.kunci !== 'toleransi_batas_meter' && parsed.data.nilai < 1) throw createError({ statusCode: 400, statusMessage: 'Nilai pengaturan di luar batas yang diizinkan.' })
  pastikanBerhasil(await simpanNilaiPengaturanKanwil(buatClientSesiUser(event), parsed.data.kunci, String(parsed.data.nilai)), 'Penyimpanan pengaturan')
  return { berhasil: true }
}

export async function simpanJenisKegiatanKanwilHandler(event: H3Event) {
  await profilKanwil(event)
  const parsed = z.object({ id: z.string().uuid().optional(), nama: z.string().trim().min(1).max(100), aktif: z.boolean().optional() }).strict().safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Nama atau status jenis kegiatan tidak valid.' })
  const hasil = await tulisJenisKegiatanKanwil(buatClientSesiUser(event), parsed.data)
  if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message.includes('duplicate') ? 'Nama jenis kegiatan sudah ada.' : hasil.error.message })
  if (!hasil.data) throw createError({ statusCode: 404, statusMessage: 'Jenis kegiatan tidak ditemukan atau perubahan ditolak.' })
  return { berhasil: true }
}
