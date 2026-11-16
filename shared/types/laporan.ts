import type { TablesInsert } from './database.types'

/** Kolom yang dihitung atau diisi trigger tidak berasal dari form masyarakat. */
export type LaporanBaru = Omit<
  TablesInsert<'laporan'>,
  'id' | 'kantor_id' | 'kode_pelacakan' | 'status' | 'created_at' | 'updated_at'
>

/** Isian kegiatan PIMPASA; identitas kantor dan akun dibuat oleh database. */
export type LaporanPimpasaBaru = Omit<
  TablesInsert<'laporan_pimpasa'>,
  'id' | 'kantor_id' | 'dibuat_oleh' | 'petugas_pengganti' | 'created_at' | 'updated_at'
>

/** Isian penugasan PIMPASA; kantor petugas diisi trigger database. */
export type PenugasanBaru = Omit<
  TablesInsert<'desa_binaan_pegawai'>,
  'id' | 'kantor_id' | 'tanggal_selesai' | 'alasan_berakhir' | 'created_at' | 'updated_at'
>
