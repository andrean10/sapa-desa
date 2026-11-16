import { createError, getQuery, getRequestHeader, readBody, readMultipartFormData, type H3Event } from 'h3'
import { z } from 'zod'
import { REGEX_KODE_PELACAKAN } from '../../shared/config/app'
import { BATAS_FILE } from '../../shared/config/batas-file'
import { JENIS_TERLAPOR, STATUS_LAPORAN } from '../../shared/config/teks'
import type { LaporanBaru } from '../../shared/types/laporan'
import type { Enums } from '../../shared/types/database.types'
import {
  ambilDesaPublik,
  ambilFaqPublik,
  ambilKabupatenPublik,
  ambilKecamatanPublik,
  cariLaporanSebelumnya,
  hapusFotoLaporan,
  lacakLaporanPublik,
  simpanFotoLaporan,
  simpanLaporan
} from '../models/publik.model'
import { batasiKirimLaporan, batasiLacakLaporan } from '../utils/rate-limit'

const PESAN_GAGAL_MEMUAT = 'Data publik belum dapat dimuat. Silakan coba lagi.'
const POLA_ID_WILAYAH = /^[0-9.]{1,30}$/

function ambilIdInduk(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !POLA_ID_WILAYAH.test(value)) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter wilayah tidak valid.' })
  }
  return value
}

export async function daftarWilayahPublik(event: H3Event) {
  const query = getQuery(event)
  const kabupatenId = ambilIdInduk(query.kabupaten_id)
  const kecamatanId = ambilIdInduk(query.kecamatan_id)

  if (kabupatenId && kecamatanId) {
    throw createError({ statusCode: 400, statusMessage: 'Pilih satu parameter wilayah induk.' })
  }

  const hasil = kecamatanId
    ? await ambilDesaPublik(kecamatanId)
    : kabupatenId
      ? await ambilKecamatanPublik(kabupatenId)
      : await ambilKabupatenPublik()

  if (hasil.error) {
    throw createError({ statusCode: 503, statusMessage: PESAN_GAGAL_MEMUAT })
  }

  return hasil.data
}

export async function daftarFaqPublik() {
  const hasil = await ambilFaqPublik()

  if (hasil.error) {
    throw createError({ statusCode: 503, statusMessage: PESAN_GAGAL_MEMUAT })
  }

  return hasil.data
}

const skemaLaporan = z.object({
  nama_pelapor: z.string().trim().min(1).max(150),
  alamat_pelapor: z.string().trim().min(1).max(500),
  desa_kelurahan_id: z.string().regex(POLA_ID_WILAYAH),
  jenis_terlapor: z.enum(JENIS_TERLAPOR.map(item => item.value) as ['wna', 'wni']),
  isi_laporan: z.string().trim().min(10).max(5000),
  lintang: z.preprocess(value => value === '' ? undefined : value, z.coerce.number().finite().min(-90).max(90)),
  bujur: z.preprocess(value => value === '' ? undefined : value, z.coerce.number().finite().min(-180).max(180)),
  akurasi_meter: z.preprocess(
    value => value === '' || value === undefined ? undefined : Number(value),
    z.number().finite().min(0).optional()
  ),
  kode_laporan_sebelumnya: z.string().trim().optional()
})

const EKSTENSI_FOTO: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

function formatFormData(parts: Awaited<ReturnType<typeof readMultipartFormData>>) {
  if (!parts) throw createError({ statusCode: 400, statusMessage: 'Format formulir tidak valid.' })

  const nilai: Record<string, string> = {}
  let foto: { data: Buffer; type: string } | undefined
  const fieldDikenal = new Set([
    'nama_pelapor', 'alamat_pelapor', 'desa_kelurahan_id', 'jenis_terlapor',
    'isi_laporan', 'lintang', 'bujur', 'akurasi_meter', 'kode_laporan_sebelumnya', 'foto'
  ])

  for (const part of parts) {
    if (!part.name || !fieldDikenal.has(part.name)) {
      throw createError({ statusCode: 400, statusMessage: 'Formulir memuat isian yang tidak dikenal.' })
    }

    if (part.name === 'foto') {
      if (foto || !part.filename) {
        throw createError({ statusCode: 400, statusMessage: 'Unggah paling banyak satu foto.' })
      }
      foto = { data: part.data, type: part.type ?? '' }
      continue
    }

    if (part.name in nilai) {
      throw createError({ statusCode: 400, statusMessage: 'Isian formulir tidak boleh berulang.' })
    }
    nilai[part.name] = part.data.toString('utf8')
  }

  return { nilai, foto }
}

export async function kirimLaporanPublik(event: H3Event) {
  batasiKirimLaporan(event)

  const panjang = Number(getRequestHeader(event, 'content-length'))
  if (Number.isFinite(panjang) && panjang > BATAS_FILE.foto.ukuranMaksimumPermintaanByte) {
    throw createError({ statusCode: 413, statusMessage: 'Ukuran data laporan melebihi batas.' })
  }

  const parts = await readMultipartFormData(event)
  const { nilai, foto } = formatFormData(parts)
  const validasi = skemaLaporan.safeParse(nilai)
  if (!validasi.success) {
    throw createError({ statusCode: 400, statusMessage: 'Periksa kembali isian laporan Anda.' })
  }

  let fotoPath: string | undefined
  if (foto) {
    const ekstensi = EKSTENSI_FOTO[foto.type]
    if (!ekstensi || !BATAS_FILE.foto.tipeDiizinkan.includes(foto.type as typeof BATAS_FILE.foto.tipeDiizinkan[number])) {
      throw createError({ statusCode: 415, statusMessage: 'Foto harus berformat JPEG, PNG, atau WebP.' })
    }
    if (foto.data.byteLength > BATAS_FILE.foto.ukuranMaksimumByte) {
      throw createError({ statusCode: 413, statusMessage: 'Ukuran foto maksimal 3 MB.' })
    }

    const hasilFoto = await simpanFotoLaporan(foto.data, foto.type, ekstensi)
    if (hasilFoto.error) {
      throw createError({ statusCode: 503, statusMessage: 'Foto belum dapat diunggah. Silakan coba lagi.' })
    }
    fotoPath = hasilFoto.path
  }

  try {
  let laporanSebelumnyaId: string | undefined
  const kodeSebelumnya = validasi.data.kode_laporan_sebelumnya?.replace(/\s+/g, '').toUpperCase()
  if (kodeSebelumnya) {
    if (!REGEX_KODE_PELACAKAN.test(kodeSebelumnya)) {
      throw createError({ statusCode: 400, statusMessage: 'Kode laporan sebelumnya tidak valid.' })
    }
    const hasilCari = await cariLaporanSebelumnya(kodeSebelumnya)
    if (hasilCari.error || !hasilCari.data) {
      throw createError({ statusCode: 404, statusMessage: 'Laporan sebelumnya tidak ditemukan.' })
    }
    laporanSebelumnyaId = hasilCari.data.id
  }

  const input: LaporanBaru = {
    nama_pelapor: validasi.data.nama_pelapor,
    alamat_pelapor: validasi.data.alamat_pelapor,
    desa_kelurahan_id: validasi.data.desa_kelurahan_id,
    jenis_terlapor: validasi.data.jenis_terlapor,
    isi_laporan: validasi.data.isi_laporan,
    lintang: validasi.data.lintang,
    bujur: validasi.data.bujur,
    ...(validasi.data.akurasi_meter !== undefined && { akurasi_meter: validasi.data.akurasi_meter }),
    ...(fotoPath && { foto_path: fotoPath }),
    ...(laporanSebelumnyaId && { laporan_sebelumnya_id: laporanSebelumnyaId })
  }

    const hasil = await simpanLaporan(input)
    if (hasil.error || !hasil.data) {
      if (hasil.error?.code === '22023') {
        throw createError({ statusCode: 422, statusMessage: 'Lokasi pelapor berada di luar Provinsi Riau.' })
      }
      throw createError({ statusCode: 503, statusMessage: 'Laporan belum dapat dikirim. Silakan coba lagi.' })
    }

    return { kode_pelacakan: hasil.data.kode_pelacakan }
  } catch (error) {
    if (fotoPath) await hapusFotoLaporan(fotoPath)
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({ statusCode: 503, statusMessage: 'Laporan belum dapat dikirim. Silakan coba lagi.' })
  }
}

const skemaKodePelacakan = z.object({ kode_pelacakan: z.string().min(1).max(64) })
const daftarStatus = STATUS_LAPORAN.map(item => item.value) as [Enums<'status_laporan'>, ...Enums<'status_laporan'>[]]
const skemaLacak = z.object({
  kode_pelacakan: z.string(),
  status: z.enum(daftarStatus),
  kantor: z.string(),
  dikirim_pada: z.string(),
  timeline: z.array(z.object({
    status: z.enum(daftarStatus),
    keterangan: z.string().nullable(),
    waktu: z.string()
  }).strict())
}).strict()

export async function lacakLaporan(event: H3Event) {
  batasiLacakLaporan(event)
  const body = skemaKodePelacakan.safeParse(await readBody(event))
  if (!body.success) {
    throw createError({ statusCode: 400, statusMessage: 'Masukkan kode pelacakan yang valid.' })
  }

  const kode = body.data.kode_pelacakan.replace(/\s+/g, '').toUpperCase()
  if (!REGEX_KODE_PELACAKAN.test(kode)) {
    throw createError({ statusCode: 400, statusMessage: 'Format kode pelacakan tidak valid.' })
  }

  const hasil = await lacakLaporanPublik(kode)
  if (hasil.error) {
    throw createError({ statusCode: 503, statusMessage: 'Status laporan belum dapat dimuat. Silakan coba lagi.' })
  }
  if (hasil.data === null) {
    throw createError({ statusCode: 404, statusMessage: 'Laporan dengan kode tersebut tidak ditemukan.' })
  }

  const dataAman = skemaLacak.safeParse(hasil.data)
  if (!dataAman.success) {
    throw createError({ statusCode: 503, statusMessage: 'Status laporan memiliki format yang tidak dikenali.' })
  }

  return dataAman.data
}
