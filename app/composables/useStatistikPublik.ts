import type { StatistikPublik } from '~~/shared/types/publik'

export function useStatistikPublik() {
  return useFetch<StatistikPublik | null>('/api/publik/statistik', {
    key: 'publik-statistik',
    default: () => null,
    server: false,
    lazy: true
  })
}
