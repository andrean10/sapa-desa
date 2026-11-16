import { getRouterParam } from 'h3'
import { namaKantorPublik } from '../../../controllers/publik.controller'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Parameter kantor tidak valid.' })
  return await namaKantorPublik(id)
})
