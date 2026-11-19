import { createError, getQuery, getRouterParam, readBody, readMultipartFormData, type H3Event } from 'h3'
import { z } from 'zod'
import { JENIS_TERLAPOR, STATUS_LAPORAN } from '../../shared/config/teks'
import { profilSesi } from './auth.controller'
import { buatClientSesiUser } from '../utils/supabase'
import { tandaiDibacaUpt, ambilDashboardUpt, ambilDesaPenugasanAktif, ambilNamaPenugasanUpt, ambilProfilKantorUpt, bersihkanLampiranKegiatan, buatSignedUrlFotoLaporan, buatSignedUrlLampiranUpt, daftarKegiatanUpt, daftarLaporanUpt, daftarPegawaiUpt, detailKegiatanUpt, detailLaporanUpt, hapusKegiatanUpt, opsiKegiatanUpt, tambahKegiatanUpt, tambahPegawaiUpt, ubahKegiatanUpt, ubahPegawaiUpt, ubahStatusLaporanUpt, unggahLampiranKegiatanUpt } from '../models/upt.model'
import { tanggalHariIniWib } from '../../shared/utils/waktu'
import { BATAS_FILE } from '../../shared/config/batas-file'
import type { Enums } from '../../shared/types/database.types'

export async function dashboardUpt(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Dashboard ini hanya untuk akun UPT.' })
  const query = getQuery(event)
  const polaTanggal = (nilai: string | undefined) => {
    if (!nilai || !/^\d{4}-\d{2}-\d{2}$/.test(nilai)) return false
    const tanggal = new Date(`${nilai}T00:00:00Z`)
    return !Number.isNaN(tanggal.getTime()) && tanggal.toISOString().slice(0, 10) === nilai
  }
  const mulai = typeof query.mulai === 'string' ? query.mulai : undefined
  const selesai = typeof query.selesai === 'string' ? query.selesai : undefined
  if ((mulai && !polaTanggal(mulai)) || (selesai && !polaTanggal(selesai)) || (mulai && selesai && mulai > selesai) || (selesai && selesai > tanggalHariIniWib())) {
    throw createError({ statusCode: 400, statusMessage: 'Periode tren tidak valid.' })
  }
  const hasil = await ambilDashboardUpt(buatClientSesiUser(event), mulai, selesai)
  if (hasil.ringkasan.error || hasil.tindakan.error || hasil.desa.error || hasil.tren.error) {
    throw createError({ statusCode: 503, statusMessage: 'Dashboard UPT belum dapat dimuat.' })
  }
  return {
    ringkasan: hasil.ringkasan.data?.[0] ?? null,
    tindakan: hasil.tindakan.data ?? [],
    desa: hasil.desa.data ?? [],
    tren: hasil.tren.data
  }
}

const skemaUbahStatus = z.object({
  status: z.enum(STATUS_LAPORAN.map(item => item.value) as ['diterima', 'diverifikasi', 'ditindaklanjuti', 'selesai', 'ditolak']),
  keterangan: z.string().trim().max(1000).optional()
}).strict()

export async function simpanStatusLaporanUpt(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Hanya UPT yang dapat mengubah status laporan.' })
  const laporanId = getRouterParam(event, 'id')
  if (!laporanId || !z.string().uuid().safeParse(laporanId).success) throw createError({ statusCode: 400, statusMessage: 'ID laporan tidak valid.' })
  const parsed = skemaUbahStatus.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Periksa status dan keterangan laporan.' })
  if (['ditolak', 'selesai'].includes(parsed.data.status) && !parsed.data.keterangan?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Keterangan wajib diisi untuk status ini.' })
  }
  const hasil = await ubahStatusLaporanUpt(buatClientSesiUser(event), {
    laporanId, status: parsed.data.status, keterangan: parsed.data.keterangan
  })
  if (hasil.error) {
    const message = hasil.error.message
    if (message.includes('tidak ditemukan')) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan.' })
    if (message.includes('Keterangan wajib')) throw createError({ statusCode: 400, statusMessage: 'Keterangan wajib diisi untuk status ini.' })
    throw createError({ statusCode: 422, statusMessage: 'Perubahan status tidak dapat dilakukan. Muat ulang laporan.' })
  }
  return { berhasil: true }
}

export async function daftarLaporanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Daftar ini hanya untuk akun UPT.' })
  const query = getQuery(event)
  const halaman = Number(query.halaman ?? 1)
  const statusRaw = query.status
  const status = Array.isArray(statusRaw) ? statusRaw : statusRaw === undefined ? [] : [statusRaw]
  const kelompok = query.kelompok
  const terlambat = query.terlambat === 'true'
  const jenis = query.jenis
  const dari = typeof query.dari === 'string' ? query.dari : undefined
  const sampai = typeof query.sampai === 'string' ? query.sampai : undefined
  const urut = query.urut
  const cariMentah = query.cari
  const tanggalValid = (nilai: string | undefined) => {
    if (!nilai || !/^\d{4}-\d{2}-\d{2}$/.test(nilai)) return false
    const tanggal = new Date(`${nilai}T00:00:00Z`)
    return !Number.isNaN(tanggal.getTime()) && tanggal.toISOString().slice(0, 10) === nilai
  }
  if (!Number.isInteger(halaman) || halaman < 1 || status.some(item => typeof item !== 'string' || !STATUS_LAPORAN.some(nilai => nilai.value === item)) || (kelompok && (kelompok !== 'ditangani' && kelompok !== 'final')) || (status.length > 0 && kelompok) || (query.terlambat && !terlambat) || (jenis && (typeof jenis !== 'string' || !JENIS_TERLAPOR.some(item => item.value === jenis))) || (dari && !tanggalValid(dari)) || (sampai && !tanggalValid(sampai)) || (dari && sampai && dari > sampai) || (urut && urut !== 'asc' && urut !== 'desc') || (cariMentah !== undefined && typeof cariMentah !== 'string')) {
    throw createError({ statusCode: 400, statusMessage: 'Filter laporan tidak valid.' })
  }
  const statusTerpilih: Enums<'status_laporan'>[] | undefined = status.length > 0
    ? status as Enums<'status_laporan'>[]
    : kelompok === 'ditangani' ? ['diverifikasi', 'ditindaklanjuti'] as Enums<'status_laporan'>[]
      : kelompok === 'final' ? ['selesai', 'ditolak'] as Enums<'status_laporan'>[] : undefined
  const cari = typeof cariMentah === 'string' ? cariMentah.trim().replace(/[^\p{L}\p{N}\s._-]/gu, '').slice(0, 100) : undefined
  const hasil = await daftarLaporanUpt(buatClientSesiUser(event), halaman, {
    status: statusTerpilih,
    terlambat,
    jenis: typeof jenis === 'string' ? jenis as Enums<'jenis_terlapor'> : undefined,
    dari,
    sampai,
    cari,
    urut: urut === 'asc' ? 'asc' : 'desc'
  })
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Daftar laporan belum dapat dimuat.' })
  return { data: hasil.data ?? [], total: hasil.count ?? 0, halaman }
}

export async function detailLaporanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Detail laporan hanya untuk akun UPT.' })
  const laporanId = getRouterParam(event, 'id')
  if (!laporanId || !z.string().uuid().safeParse(laporanId).success) throw createError({ statusCode: 400, statusMessage: 'ID laporan tidak valid.' })
  const hasil = await detailLaporanUpt(buatClientSesiUser(event), laporanId)
  if (hasil.laporan.error || hasil.riwayat.error || hasil.desa?.error || hasil.kecamatan?.error || hasil.kabupaten?.error || hasil.kantor?.error || hasil.pegawai.error || hasil.laporanSebelumnya?.error) throw createError({ statusCode: 503, statusMessage: 'Detail laporan belum dapat dimuat.' })
  if (!hasil.laporan.data) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan.' })
  // Dibuka UPT pemilik = dibaca (hanya pertama kali). Gagal mencatat tidak boleh menghalangi UPT membaca aduan.
  await tandaiDibacaUpt(buatClientSesiUser(event), laporanId).catch(() => undefined)
  const { foto_path, ...laporan } = hasil.laporan.data
  let foto_url: string | null = null
  if (foto_path) {
    const signed = await buatSignedUrlFotoLaporan(foto_path)
    if (signed.error) throw createError({ statusCode: 503, statusMessage: 'Foto laporan belum dapat dimuat.' })
    foto_url = signed.data.signedUrl
  }
  return {
    ...laporan,
    foto_url,
    lokasi: { desa: hasil.desa?.data?.nama ?? null, kecamatan: hasil.kecamatan?.data?.nama ?? null, kabupaten: hasil.kabupaten?.data?.nama ?? null },
    kantor: hasil.kantor?.data?.nama ?? null,
    laporan_sebelumnya: hasil.laporanSebelumnya?.data ?? null,
    riwayat_status: (hasil.riwayat.data ?? []).map(item => ({ ...item, nama_pegawai: hasil.pegawai.data?.find(pegawai => pegawai.id === item.pegawai_id)?.nama ?? null }))
  }
}

export async function daftarPegawaiUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Daftar pegawai ini hanya untuk akun UPT.' })
  const hasil = await daftarPegawaiUpt(buatClientSesiUser(event))
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Daftar pegawai belum dapat dimuat.' })
  return hasil.data ?? []
}

const skemaPegawai = z.object({ nama: z.string().trim().min(1).max(150), nip: z.string().trim().max(30).optional() }).strict()
export async function tambahPegawaiUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Hanya UPT yang dapat mengelola pegawainya.' })
  const input = skemaPegawai.safeParse(await readBody(event))
  if (!input.success) throw createError({ statusCode: 400, statusMessage: 'Nama atau NIP pegawai tidak valid.' })
  const hasil = await tambahPegawaiUpt(buatClientSesiUser(event), input.data.nama, input.data.nip)
  if (hasil.error?.code === '23505') throw createError({ statusCode: 409, statusMessage: 'Nama pegawai sudah terdaftar di kantor Anda.' })
  if (hasil.error || !hasil.data) throw createError({ statusCode: 503, statusMessage: 'Pegawai belum dapat ditambahkan.' })
  return hasil.data
}

export async function ubahPegawaiUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Hanya UPT yang dapat mengelola pegawainya.' })
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID pegawai tidak valid.' })
  const body = await readBody(event)
  const validasi = z.object({ nama: z.string().trim().min(1).max(150).optional(), nip: z.string().trim().max(30).nullable().optional(), aktif: z.boolean().optional() }).strict().safeParse(body)
  if (!validasi.success || !Object.keys(validasi.data ?? {}).length) throw createError({ statusCode: 400, statusMessage: 'Perubahan pegawai tidak valid.' })
  const client = buatClientSesiUser(event)
  if (validasi.data.aktif === false) {
    const desa = await ambilDesaPenugasanAktif(client, id)
    if (desa.error) throw createError({ statusCode: 503, statusMessage: 'Status penugasan pegawai belum dapat diperiksa.' })
    if (desa.data.length) throw createError({ statusCode: 409, statusMessage: `Tidak dapat dinonaktifkan: masih bertugas sebagai PIMPASA di ${desa.data.join(', ')}. Minta Kanwil mengakhiri penugasannya terlebih dahulu.` })
  }
  const hasil = await ubahPegawaiUpt(client, id, validasi.data)
  if (hasil.error?.code === '23505') throw createError({ statusCode: 409, statusMessage: 'Nama pegawai sudah terdaftar di kantor Anda.' })
  if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message })
  if (!hasil.data) throw createError({ statusCode: 404, statusMessage: 'Pegawai tidak ditemukan.' })
  return hasil.data
}

export async function profilKantorUpt(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt' || !profil.kantor_id) throw createError({ statusCode: 403, statusMessage: 'Profil kantor hanya untuk akun UPT.' })
  const client = buatClientSesiUser(event)
  const hasil = await ambilProfilKantorUpt(client, profil.kantor_id)
  if (hasil.kantor.error || hasil.kabupaten.error || hasil.penugasan.error || !hasil.kantor.data) throw createError({ statusCode: 503, statusMessage: 'Profil kantor belum dapat dimuat.' })
  const penugasan = hasil.penugasan.data ?? []
  const nama = await ambilNamaPenugasanUpt(client, [...new Set(penugasan.map(item => item.pegawai_id))], [...new Set(penugasan.map(item => item.desa_id))])
  if (nama.pegawai.error || nama.desa.error) throw createError({ statusCode: 503, statusMessage: 'Petugas PIMPASA belum dapat dimuat.' })
  return {
    username: profil.username,
    kantor: hasil.kantor.data,
    kabupaten: hasil.kabupaten.data ?? [],
    pimpasa: penugasan.map(item => ({
      ...item,
      pegawai: nama.pegawai.data?.find(pegawai => pegawai.id === item.pegawai_id)?.nama ?? 'Pegawai tidak tersedia',
      desa: nama.desa.data?.find(desa => desa.id === item.desa_id)?.nama ?? 'Desa tidak tersedia',
      kecamatan: nama.desa.data?.find(desa => desa.id === item.desa_id)?.kecamatan ?? 'Kecamatan tidak tersedia',
      kabupaten: nama.desa.data?.find(desa => desa.id === item.desa_id)?.kabupaten ?? 'Kabupaten/kota tidak tersedia'
    }))
  }
}

export async function daftarKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Laporan kegiatan hanya untuk akun UPT.' })
  const hasil = await daftarKegiatanUpt(buatClientSesiUser(event))
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Laporan kegiatan belum dapat dimuat.' })
  return { data: hasil.data ?? [], batas_menit_hapus: hasil.batasMenitHapus ?? 10 }
}

const skemaKegiatan = z.object({
  tanggal_kegiatan: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  desa_id: z.string().min(1),
  pegawai_id: z.string().uuid(),
  jenis_kegiatan_id: z.string().uuid(),
  jumlah_peserta: z.coerce.number().int().min(1).max(100000),
  uraian_hasil: z.string().trim().min(10).max(5000),
  // Nama petugas yang menggantikan PIMPASA (atas perintah KASI INTELDAKIM). Kosong = PIMPASA sendiri yang terjun.
  petugas_pengganti_nama: z.string().trim().max(150).optional(),
  foto_paths: z.array(z.string()).max(3).optional(),
  pdf_path: z.string().optional()
}).strict()

export async function tambahKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt' || !profil.kantor_id) throw createError({ statusCode: 403, statusMessage: 'Hanya UPT yang dapat membuat laporan kegiatan.' })
  const input = skemaKegiatan.safeParse(await readBody(event))
  if (!input.success || input.data.tanggal_kegiatan > tanggalHariIniWib()) throw createError({ statusCode: 400, statusMessage: 'Periksa kembali isian laporan kegiatan.' })
  validasiPathLampiran(input.data, profil.kantor_id)
  const client = buatClientSesiUser(event)
  const hasil = await tambahKegiatanUpt(client, input.data)
  if (hasil.error) {
    await bersihkanLampiranKegiatan(input.data.foto_paths, input.data.pdf_path)
    throw createError({ statusCode: 422, statusMessage: hasil.error.message })
  }
  return { id: hasil.data.id }
}

export async function unggahLampiranKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt' || !profil.kantor_id) throw createError({ statusCode: 403, statusMessage: 'Unggah lampiran hanya untuk akun UPT.' })
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file')
  const jenis = parts?.find(part => part.name === 'jenis')?.data.toString('utf8')
  if (!file || parts?.length !== 2 || !jenis || !['foto', 'pdf'].includes(jenis)) throw createError({ statusCode: 400, statusMessage: 'Pilih satu lampiran yang valid.' })
  const pdf = jenis === 'pdf'
  const tipeFile = file.type ?? ''
  const tipeDiizinkan = pdf ? BATAS_FILE.pdf.tipeDiizinkan : BATAS_FILE.foto.tipeDiizinkan
  const batasByte = pdf ? BATAS_FILE.pdf.ukuranMaksimumByte : BATAS_FILE.foto.ukuranMaksimumByte
  if (!tipeDiizinkan.includes(tipeFile as never)) throw createError({ statusCode: 415, statusMessage: pdf ? 'Laporan harus berformat PDF.' : 'Foto harus JPEG, PNG, atau WebP.' })
  if (file.data.byteLength > batasByte) throw createError({ statusCode: 413, statusMessage: pdf ? 'Ukuran PDF maksimal 8 MB.' : 'Ukuran foto maksimal 3 MB.' })
  const bucket = pdf ? 'laporan-pdf' : 'foto-kegiatan'
  const hasil = await unggahLampiranKegiatanUpt(buatClientSesiUser(event), profil.kantor_id!, bucket, file.data, tipeFile)
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Lampiran belum dapat diunggah.' })
  return { path: hasil.path }
}

export async function bersihkanLampiranKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt' || !profil.kantor_id) throw createError({ statusCode: 403, statusMessage: 'Pembersihan lampiran hanya untuk akun UPT.' })
  const parsed = z.object({ foto_paths: z.array(z.string()).max(3).optional(), pdf_path: z.string().optional() }).strict().safeParse(await readBody(event))
  if (!parsed.success || (!parsed.data.foto_paths?.length && !parsed.data.pdf_path)) throw createError({ statusCode: 400, statusMessage: 'Path lampiran tidak valid.' })
  validasiPathLampiran(parsed.data, profil.kantor_id)
  const berhasil = await bersihkanLampiranKegiatan(parsed.data.foto_paths, parsed.data.pdf_path)
  if (!berhasil) throw createError({ statusCode: 503, statusMessage: 'Lampiran sementara belum dapat dibersihkan.' })
  return { berhasil: true }
}

export async function opsiKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt' || !profil.kantor_id) throw createError({ statusCode: 403, statusMessage: 'Form kegiatan hanya untuk akun UPT.' })
  const hasil = await opsiKegiatanUpt(buatClientSesiUser(event), profil.kantor_id)
  if (hasil.desa.error || hasil.pegawai.error || hasil.jenis.error || hasil.penugasan.error) throw createError({ statusCode: 503, statusMessage: 'Pilihan form kegiatan belum dapat dimuat.' })
  return { desa: hasil.desa.data ?? [], pegawai: hasil.pegawai.data ?? [], jenis: hasil.jenis.data ?? [], penugasan: hasil.penugasan.data ?? [] }
}

export async function ubahKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt' || !profil.kantor_id) throw createError({ statusCode: 403, statusMessage: 'Hanya UPT yang dapat mengubah laporan kegiatan.' })
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID kegiatan tidak valid.' })
  const parsed = skemaKegiatan.omit({ desa_id: true }).safeParse(await readBody(event))
  if (!parsed.success || parsed.data.tanggal_kegiatan > tanggalHariIniWib()) throw createError({ statusCode: 400, statusMessage: 'Periksa kembali isian kegiatan.' })
  validasiPathLampiran(parsed.data, profil.kantor_id)
  const client = buatClientSesiUser(event)
  const sebelum = await detailKegiatanUpt(client, id)
  if (sebelum.error || !sebelum.data) throw createError({ statusCode: 404, statusMessage: 'Laporan kegiatan tidak ditemukan.' })
  const fotoSebelum = sebelum.data.foto_paths
  const fotoSesudah = parsed.data.foto_paths ?? fotoSebelum
  const fotoBaru = fotoSesudah.filter(path => !fotoSebelum.includes(path))
  const fotoDibuang = fotoSebelum.filter(path => !fotoSesudah.includes(path))
  const pdfBaru = parsed.data.pdf_path && parsed.data.pdf_path !== sebelum.data.pdf_path ? parsed.data.pdf_path : null
  const hasil = await ubahKegiatanUpt(client, id, parsed.data)
  if (hasil.error || !hasil.data) {
    await bersihkanLampiranKegiatan(fotoBaru, pdfBaru)
    if (hasil.error) throw createError({ statusCode: 422, statusMessage: hasil.error.message })
    throw createError({ statusCode: 404, statusMessage: 'Laporan kegiatan tidak ditemukan.' })
  }
  await bersihkanLampiranKegiatan(fotoDibuang, pdfBaru ? sebelum.data.pdf_path : null)
  return { berhasil: true }
}

function validasiPathLampiran(data: { foto_paths?: string[]; pdf_path?: string }, kantorId: string) {
  const pola = new RegExp(`^${kantorId}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(?:jpg|png|webp|pdf)$`, 'i')
  for (const path of [...(data.foto_paths ?? []), data.pdf_path]) {
    if (path && !pola.test(path)) throw createError({ statusCode: 400, statusMessage: 'Path lampiran tidak valid untuk kantor Anda.' })
  }
  if (data.foto_paths?.some(path => path.endsWith('.pdf')) || data.pdf_path && !data.pdf_path.endsWith('.pdf')) {
    throw createError({ statusCode: 400, statusMessage: 'Jenis path lampiran tidak sesuai.' })
  }
  if (data.foto_paths && new Set(data.foto_paths).size !== data.foto_paths.length) {
    throw createError({ statusCode: 400, statusMessage: 'Foto kegiatan tidak boleh duplikat.' })
  }
}

export async function detailKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt' || !profil.kantor_id) throw createError({ statusCode: 403, statusMessage: 'Detail kegiatan hanya untuk akun UPT.' })
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID kegiatan tidak valid.' })
  const hasil = await detailKegiatanUpt(buatClientSesiUser(event), id)
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Detail kegiatan belum dapat dimuat.' })
  if (!hasil.data) throw createError({ statusCode: 404, statusMessage: 'Laporan kegiatan tidak ditemukan.' })
  const { foto_paths, pdf_path, ...kegiatan } = hasil.data
  const [foto, pdf] = await Promise.all([
    Promise.all(foto_paths.map(path => buatSignedUrlLampiranUpt('foto-kegiatan', path, profil.kantor_id!))),
    pdf_path ? buatSignedUrlLampiranUpt('laporan-pdf', pdf_path, profil.kantor_id) : Promise.resolve({ data: null, error: null })
  ])
  if (foto.some(item => item.error) || pdf.error) throw createError({ statusCode: 503, statusMessage: 'Lampiran kegiatan belum dapat dimuat.' })
  return { ...kegiatan, foto_paths, pdf_path: pdf_path ?? null, foto_urls: foto.map(item => item.data?.signedUrl ?? ''), pdf_url: pdf.data?.signedUrl ?? null }
}

export async function hapusKegiatanUptController(event: H3Event) {
  const profil = await profilSesi(event)
  if (profil.peran !== 'upt') throw createError({ statusCode: 403, statusMessage: 'Hanya UPT yang dapat menghapus laporan kegiatan.' })
  const id = getRouterParam(event, 'id')
  if (!id || !z.string().uuid().safeParse(id).success) throw createError({ statusCode: 400, statusMessage: 'ID kegiatan tidak valid.' })
  const hasil = await hapusKegiatanUpt(buatClientSesiUser(event), id)
  if (hasil.error) throw createError({ statusCode: 503, statusMessage: 'Laporan dihapus, tetapi lampiran belum seluruhnya terhapus.' })
  if (!hasil.data) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak dapat dihapus karena batas waktu hapus sudah lewat atau laporan tidak ditemukan.' })
  return { berhasil: true }
}
