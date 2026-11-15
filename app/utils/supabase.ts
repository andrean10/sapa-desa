import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '~~/shared/types/database.types'

/** Client browser ber-anon-key untuk Auth dan data publik saja. */
export function buatClientBrowser() {
  const config = useRuntimeConfig()

  return createBrowserClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )
}
