// FILE DIBUAT DARI KATALOG DATABASE (schema public).
// Sumber: pg_catalog pada kondisi migrasi 001-021 + perbaikan terbaru.
// Format mengikuti output `supabase gen types typescript`.
// JANGAN DIEDIT MANUAL. Generate ulang setelah ada perubahan skema.
// Relasi (Relationships) belum disertakan di file ini; untuk join bertipe
// penuh, generate ulang dengan Supabase CLI (lihat cara generate di AGENTS.md).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      desa_binaan_pegawai: {
        Row: {
          alasan_berakhir: Database["public"]["Enums"]["alasan_berakhir_penugasan"] | null
          created_at: string
          desa_id: string
          id: string
          kantor_id: string
          pegawai_id: string
          tanggal_mulai: string
          tanggal_selesai: string | null
          updated_at: string
        }
        Insert: {
          alasan_berakhir?: Database["public"]["Enums"]["alasan_berakhir_penugasan"] | null
          created_at?: string
          desa_id: string
          id?: string
          kantor_id: string
          pegawai_id: string
          tanggal_mulai?: string
          tanggal_selesai?: string | null
          updated_at?: string
        }
        Update: {
          alasan_berakhir?: Database["public"]["Enums"]["alasan_berakhir_penugasan"] | null
          created_at?: string
          desa_id?: string
          id?: string
          kantor_id?: string
          pegawai_id?: string
          tanggal_mulai?: string
          tanggal_selesai?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      desa_kelurahan: {
        Row: {
          created_at: string
          dbi: boolean
          id: string
          jenis_wilayah: Database["public"]["Enums"]["jenis_wilayah_desa"]
          kecamatan_id: string
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dbi?: boolean
          id: string
          jenis_wilayah: Database["public"]["Enums"]["jenis_wilayah_desa"]
          kecamatan_id: string
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dbi?: boolean
          id?: string
          jenis_wilayah?: Database["public"]["Enums"]["jenis_wilayah_desa"]
          kecamatan_id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          created_at: string
          id: string
          jawaban: string
          pertanyaan: string
          updated_at: string
          urutan: number
        }
        Insert: {
          created_at?: string
          id?: string
          jawaban: string
          pertanyaan: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          created_at?: string
          id?: string
          jawaban?: string
          pertanyaan?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      hari_libur: {
        Row: {
          created_at: string
          dibuat_oleh: string | null
          keterangan: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          dibuat_oleh?: string | null
          keterangan: string
          tanggal: string
        }
        Update: {
          created_at?: string
          dibuat_oleh?: string | null
          keterangan?: string
          tanggal?: string
        }
        Relationships: []
      }
      jenis_kegiatan: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          nama: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      kabupaten: {
        Row: {
          created_at: string
          id: string
          jenis: Database["public"]["Enums"]["jenis_daerah"]
          kantor_id: string
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          jenis: Database["public"]["Enums"]["jenis_daerah"]
          kantor_id: string
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis?: Database["public"]["Enums"]["jenis_daerah"]
          kantor_id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      kantor_imigrasi: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          kode: string
          nama: string
          nama_singkat: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          kode: string
          nama: string
          nama_singkat: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          kode?: string
          nama?: string
          nama_singkat?: string
          updated_at?: string
        }
        Relationships: []
      }
      kecamatan: {
        Row: {
          created_at: string
          id: string
          kabupaten_id: string
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          kabupaten_id: string
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kabupaten_id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      laporan: {
        Row: {
          akurasi_meter: number | null
          alamat_pelapor: string
          bujur: number
          created_at: string
          desa_kelurahan_id: string
          foto_path: string | null
          id: string
          isi_laporan: string
          jenis_terlapor: Database["public"]["Enums"]["jenis_terlapor"]
          kantor_id: string
          kode_pelacakan: string
          laporan_sebelumnya_id: string | null
          lintang: number
          nama_pelapor: string
          status: Database["public"]["Enums"]["status_laporan"]
          updated_at: string
        }
        Insert: {
          akurasi_meter?: number | null
          alamat_pelapor: string
          bujur: number
          created_at?: string
          desa_kelurahan_id: string
          foto_path?: string | null
          id?: string
          isi_laporan: string
          jenis_terlapor: Database["public"]["Enums"]["jenis_terlapor"]
          kantor_id: string
          kode_pelacakan: string
          laporan_sebelumnya_id?: string | null
          lintang: number
          nama_pelapor: string
          status?: Database["public"]["Enums"]["status_laporan"]
          updated_at?: string
        }
        Update: {
          akurasi_meter?: number | null
          alamat_pelapor?: string
          bujur?: number
          created_at?: string
          desa_kelurahan_id?: string
          foto_path?: string | null
          id?: string
          isi_laporan?: string
          jenis_terlapor?: Database["public"]["Enums"]["jenis_terlapor"]
          kantor_id?: string
          kode_pelacakan?: string
          laporan_sebelumnya_id?: string | null
          lintang?: number
          nama_pelapor?: string
          status?: Database["public"]["Enums"]["status_laporan"]
          updated_at?: string
        }
        Relationships: []
      }
      laporan_dibaca: {
        Row: {
          dibaca_oleh: string
          dibaca_pada: string
          laporan_id: string
        }
        Insert: {
          dibaca_oleh: string
          dibaca_pada?: string
          laporan_id: string
        }
        Update: {
          dibaca_oleh?: string
          dibaca_pada?: string
          laporan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laporan_dibaca_laporan_id_fkey"
            columns: ["laporan_id"]
            isOneToOne: true
            referencedRelation: "laporan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_dibaca_laporan_id_fkey"
            columns: ["laporan_id"]
            isOneToOne: true
            referencedRelation: "v_laporan_belum_ditanggapi"
            referencedColumns: ["id"]
          },
        ]
      }
      laporan_pimpasa: {
        Row: {
          created_at: string
          desa_id: string
          dibuat_oleh: string
          foto_path: string | null
          id: string
          jenis_kegiatan_id: string
          jumlah_peserta: number
          kantor_id: string
          pdf_path: string | null
          pegawai_id: string
          petugas_pengganti: boolean | null
          petugas_pengganti_nama: string | null
          tanggal_kegiatan: string
          updated_at: string
          uraian_hasil: string
        }
        Insert: {
          created_at?: string
          desa_id: string
          dibuat_oleh: string
          foto_path?: string | null
          id?: string
          jenis_kegiatan_id: string
          jumlah_peserta: number
          kantor_id: string
          pdf_path?: string | null
          pegawai_id: string
          petugas_pengganti?: boolean | null
          petugas_pengganti_nama?: string | null
          tanggal_kegiatan: string
          updated_at?: string
          uraian_hasil: string
        }
        Update: {
          created_at?: string
          desa_id?: string
          dibuat_oleh?: string
          foto_path?: string | null
          id?: string
          jenis_kegiatan_id?: string
          jumlah_peserta?: number
          kantor_id?: string
          pdf_path?: string | null
          pegawai_id?: string
          petugas_pengganti?: boolean | null
          petugas_pengganti_nama?: string | null
          tanggal_kegiatan?: string
          updated_at?: string
          uraian_hasil?: string
        }
        Relationships: []
      }
      log_aktivitas: {
        Row: {
          aksi: string
          akun_id: string | null
          baris_id: string | null
          data_baru: Json | null
          data_lama: Json | null
          id: string
          kantor_id: string | null
          keterangan: string | null
          pegawai_id: string | null
          pegawai_nama: string | null
          peran: Database["public"]["Enums"]["peran_pengguna"] | null
          tabel: string | null
          username: string | null
          waktu: string
        }
        Insert: {
          aksi: string
          akun_id?: string | null
          baris_id?: string | null
          data_baru?: Json | null
          data_lama?: Json | null
          id?: string
          kantor_id?: string | null
          keterangan?: string | null
          pegawai_id?: string | null
          pegawai_nama?: string | null
          peran?: Database["public"]["Enums"]["peran_pengguna"] | null
          tabel?: string | null
          username?: string | null
          waktu?: string
        }
        Update: {
          aksi?: string
          akun_id?: string | null
          baris_id?: string | null
          data_baru?: Json | null
          data_lama?: Json | null
          id?: string
          kantor_id?: string | null
          keterangan?: string | null
          pegawai_id?: string | null
          pegawai_nama?: string | null
          peran?: Database["public"]["Enums"]["peran_pengguna"] | null
          tabel?: string | null
          username?: string | null
          waktu?: string
        }
        Relationships: []
      }
      pegawai: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          kantor_id: string
          nama: string
          nip: string | null
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          kantor_id: string
          nama: string
          nip?: string | null
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          kantor_id?: string
          nama?: string
          nip?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pengaturan: {
        Row: {
          created_at: string
          keterangan: string | null
          kunci: string
          nilai: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          keterangan?: string | null
          kunci: string
          nilai: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          keterangan?: string | null
          kunci?: string
          nilai?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          kantor_id: string | null
          nama_tampil: string
          peran: Database["public"]["Enums"]["peran_pengguna"]
          updated_at: string
          username: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id: string
          kantor_id?: string | null
          nama_tampil: string
          peran: Database["public"]["Enums"]["peran_pengguna"]
          updated_at?: string
          username: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          kantor_id?: string | null
          nama_tampil?: string
          peran?: Database["public"]["Enums"]["peran_pengguna"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      riwayat_status: {
        Row: {
          created_at: string
          dibuat_oleh: string | null
          diproses_oleh: string | null
          id: string
          keterangan: string | null
          laporan_id: string
          pegawai_id: string | null
          status: Database["public"]["Enums"]["status_laporan"]
        }
        Insert: {
          created_at?: string
          dibuat_oleh?: string | null
          diproses_oleh?: string | null
          id?: string
          keterangan?: string | null
          laporan_id: string
          pegawai_id?: string | null
          status: Database["public"]["Enums"]["status_laporan"]
        }
        Update: {
          created_at?: string
          dibuat_oleh?: string | null
          diproses_oleh?: string | null
          id?: string
          keterangan?: string | null
          laporan_id?: string
          pegawai_id?: string | null
          status?: Database["public"]["Enums"]["status_laporan"]
        }
        Relationships: []
      }
      wilayah_riau: {
        Row: {
          geom: unknown
          id: number
          nama: string
          sumber: string | null
          updated_at: string
        }
        Insert: {
          geom: unknown
          id?: number
          nama: string
          sumber?: string | null
          updated_at?: string
        }
        Update: {
          geom?: unknown
          id?: number
          nama?: string
          sumber?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_laporan_belum_ditanggapi: {
        Row: {
          batas_hari: number | null
          desa: string | null
          desa_kelurahan_id: string | null
          hari_kerja_berjalan: number | null
          id: string | null
          jenis_terlapor: Database["public"]["Enums"]["jenis_terlapor"] | null
          kabupaten: string | null
          kantor: string | null
          kantor_id: string | null
          kecamatan: string | null
          kode_pelacakan: string | null
          masuk_pada: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cabut_dbi: {
        Args: { p_desa_id: string }
        Returns: number
      }
      cek_lokasi_riau: {
        Args: { p_bujur: number; p_lintang: number }
        Returns: boolean
      }
      dashboard_admin_status: {
        Args: never
        Returns: {
          akun_admin: number
          akun_kanwil: number
          akun_nonaktif: number
          akun_upt: number
          validasi_lokasi_aktif: boolean
        }[]
      }
      dashboard_kanwil_per_upt: {
        Args: { p_mulai?: string; p_selesai?: string }
        Returns: {
          belum_ditanggapi: number
          desa_binaan: number
          desa_tanpa_kegiatan: number
          direspon: number
          kantor: string
          kantor_id: string
          kegiatan: number
          laporan_masuk: number
          sedang_ditangani: number
          terlambat: number
        }[]
      }
      dashboard_kanwil_ringkasan: {
        Args: { p_mulai?: string; p_selesai?: string }
        Returns: {
          batas_hari: number
          belum_ditanggapi: number
          desa_binaan: number
          desa_tanpa_kegiatan: number
          ditolak_periode: number
          kegiatan_periode: number
          laporan_masuk: number
          periode_mulai: string
          periode_selesai: string
          pimpasa_aktif: number
          sedang_ditangani: number
          selesai_periode: number
          terlambat: number
        }[]
      }
      dashboard_kanwil_tren: {
        Args: { p_mulai?: string; p_selesai?: string }
        Returns: Json
      }
      dashboard_upt_desa_binaan: {
        Args: { p_kantor_id?: string }
        Returns: {
          desa: string
          desa_id: string
          hari_sejak_kegiatan: number
          kabupaten: string
          kecamatan: string
          kegiatan_bulan_ini: number
          kegiatan_terakhir: string | null
          petugas: string
        }[]
      }
      dashboard_upt_perlu_tindakan: {
        Args: { p_kantor_id?: string; p_limit?: number }
        Returns: {
          batas_hari: number
          desa: string
          hari_kerja_berjalan: number
          jenis_terlapor: Database["public"]["Enums"]["jenis_terlapor"]
          kecamatan: string
          kode_pelacakan: string
          laporan_id: string
          masuk_pada: string
          sisa_hari_kerja: number
        }[]
      }
      dashboard_upt_ringkasan: {
        Args: { p_kantor_id?: string }
        Returns: {
          batas_hari: number
          kegiatan_bulan_ini: number
          perlu_ditanggapi: number
          sedang_ditangani: number
          selesai_ditolak_bulan_ini: number
          terlambat: number
        }[]
      }
      dashboard_upt_tren: {
        Args: { p_kantor_id?: string; p_mulai?: string; p_selesai?: string }
        Returns: Json
      }
      hitung_hari_kerja: {
        Args: { p_mulai: string; p_selesai: string }
        Returns: number
      }
      lacak_laporan: {
        Args: { p_kode: string }
        Returns: Json
      }
      peringkat_desa: {
        Args: { p_hanya_non_dbi?: boolean; p_mulai?: string; p_selesai?: string }
        Returns: {
          dbi: boolean
          desa: string
          desa_id: string
          jumlah_laporan: number
          kabupaten: string
          kecamatan: string
          peringkat: number
        }[]
      }
      peringkat_kecamatan: {
        Args: { p_mulai?: string; p_selesai?: string }
        Returns: {
          jumlah_laporan: number
          kabupaten: string
          kecamatan: string
          kecamatan_id: string
          peringkat: number
        }[]
      }
      peringkat_upt: {
        Args: { p_mulai?: string; p_selesai?: string }
        Returns: {
          kantor: string
          kantor_id: string
          laporan_direspon: number
          laporan_kegiatan: number
          peringkat_kegiatan: number
          peringkat_respons: number
        }[]
      }
      tandai_dibaca: { Args: { p_laporan_id: string }; Returns: undefined }
      tetapkan_dbi: {
        Args: { p_desa_id: string }
        Returns: undefined
      }
      ubah_status_laporan: {
        Args: {
          p_keterangan?: string
          p_laporan_id: string
          p_pegawai_id?: string
          p_status: Database["public"]["Enums"]["status_laporan"]
        }
        Returns: undefined
      }
      ubah_wilayah_kerja: {
        Args: { p_kabupaten_id: string; p_kantor_id: string }
        Returns: number
      }
    }
    Enums: {
      alasan_berakhir_penugasan: "rotasi" | "mutasi" | "desa_dicabut" | "lainnya"
      jenis_daerah: "kabupaten" | "kota"
      jenis_terlapor: "wna" | "wni"
      jenis_wilayah_desa: "desa" | "kelurahan" | "kampung" | "kepenghuluan"
      peran_pengguna: "admin" | "kanwil" | "upt"
      status_laporan: "diterima" | "diverifikasi" | "ditindaklanjuti" | "selesai" | "ditolak"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  TableName extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Insert: infer I } ? I : never

export type TablesUpdate<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Update: infer U } ? U : never

export type Enums<EnumName extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][EnumName]

export const Constants = {
  public: {
    Enums: {
      alasan_berakhir_penugasan: ["rotasi", "mutasi", "desa_dicabut", "lainnya"],
      jenis_daerah: ["kabupaten", "kota"],
      jenis_terlapor: ["wna", "wni"],
      jenis_wilayah_desa: ["desa", "kelurahan", "kampung", "kepenghuluan"],
      peran_pengguna: ["admin", "kanwil", "upt"],
      status_laporan: ["diterima", "diverifikasi", "ditindaklanjuti", "selesai", "ditolak"],
    },
  },
} as const
