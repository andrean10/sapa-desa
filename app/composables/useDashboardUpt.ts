import type { Database, Json } from '~~/shared/types/database.types'

type DashboardUpt = {
  ringkasan: Database['public']['Functions']['dashboard_upt_ringkasan']['Returns'][number] | null
  tindakan: Database['public']['Functions']['dashboard_upt_perlu_tindakan']['Returns']
  desa: Database['public']['Functions']['dashboard_upt_desa_binaan']['Returns']
  tren: Json
}

export function useDashboardUpt(periode: MaybeRefOrGetter<{ mulai?: string; selesai?: string }> = {}) {
  const api = useApi()
  return useAsyncData<DashboardUpt>('dashboard-upt', async () => await api<DashboardUpt>('/api/upt/dashboard', { query: toValue(periode) }), {
    watch: [() => toValue(periode)],
    default: () => ({ ringkasan: null, tindakan: [], desa: [], tren: null })
  })
}
