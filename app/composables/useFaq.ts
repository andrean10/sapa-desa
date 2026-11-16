import type { FaqPublik } from '~~/shared/types/publik'

export function useFaq() {
  return useFetch<FaqPublik[]>('/api/publik/faq', {
    key: 'publik-faq',
    default: () => []
  })
}
