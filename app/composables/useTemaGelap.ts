// Mode gelap area dashboard. Pilihan disimpan di cookie `tema` (terang/gelap) agar server langsung merender tema yang benar tanpa berkedip.
export function useTemaGelap() {
  const pilihan = useCookie<'terang' | 'gelap'>('tema', { default: () => 'terang', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const gelap = computed(() => pilihan.value === 'gelap')
  const ganti = () => { pilihan.value = gelap.value ? 'terang' : 'gelap' }
  return { gelap, ganti }
}
