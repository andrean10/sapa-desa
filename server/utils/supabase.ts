import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { parseCookies, setCookie, type H3Event } from 'h3'
import type { Database } from '../../shared/types/database.types'

/** Client anon untuk pembacaan data publik dari server. */
export function buatClientAnonimo(event?: H3Event) {
  const config = useRuntimeConfig(event)

  return createClient<Database>(config.public.supabaseUrl, config.public.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

/** Client sesi user; token dipulihkan dari cookie dan RLS tetap berlaku. */
export function buatClientSesiUser(event: H3Event) {
  const config = useRuntimeConfig(event)

  return createServerClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return Object.entries(parseCookies(event)).map(([name, value]) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            setCookie(event, name, value, options)
          }
        }
      }
    }
  )
}

/** Client service-role untuk jalur server terbatas; jangan impor dari app/. */
export function buatClientServiceRole() {
  const config = useRuntimeConfig()

  return createClient<Database>(config.public.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}
