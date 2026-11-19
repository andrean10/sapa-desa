// Status buka-tutup dialog ganti password. Satu dialog dipasang di layout dashboard, pemicunya boleh banyak (menu akun, halaman profil).
export function useDialogGantiPassword() {
  const terbuka = useState('dialog-ganti-password', () => false)
  return { terbuka, buka: () => { terbuka.value = true } }
}
