import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '../../shared/types/database.types'

export type ProfilSesi = Pick<
  Tables<'profiles'>,
  'id' | 'username' | 'nama_tampil' | 'peran' | 'kantor_id' | 'aktif'
>

export async function ambilProfilSesi(client: SupabaseClient<Database>, userId: string) {
  return client
    .from('profiles')
    .select('id, username, nama_tampil, peran, kantor_id, aktif')
    .eq('id', userId)
    .maybeSingle()
}

