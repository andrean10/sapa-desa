import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Komponen shadcn-vue hasil generate: dibiarkan sesuai sumbernya, jadi aturan default-prop dimatikan di sini.
  files: ['app/components/ui/**/*.vue'],
  rules: { 'vue/require-default-prop': 'off' }
})
