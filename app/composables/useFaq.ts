import type { Tables } from '~~/shared/types/database.types'

type FaqPublik = Pick<Tables<'faq'>, 'id' | 'pertanyaan' | 'jawaban'>

export function useFaq() {
  return useFetch<FaqPublik[]>('/api/publik/faq', {
    key: 'publik-faq',
    default: () => []
  })
}
