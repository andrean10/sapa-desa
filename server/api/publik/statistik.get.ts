import { statistikPublik } from '../../controllers/publik.controller'

// Angka jarang berubah; cache 1 jam (stale-while-revalidate) supaya landing page tidak menembak database di setiap kunjungan.
export default defineCachedEventHandler(statistikPublik, { name: 'statistik-publik', maxAge: 60 * 60, swr: true })
