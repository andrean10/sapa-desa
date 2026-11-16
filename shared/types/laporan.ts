import type { TablesInsert } from './database.types'

/** Kolom yang dihitung atau diisi trigger tidak berasal dari form masyarakat. */
export type LaporanBaru = Omit<
  TablesInsert<'laporan'>,
  'id' | 'kantor_id' | 'kode_pelacakan' | 'status' | 'created_at' | 'updated_at'
>
