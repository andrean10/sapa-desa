import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: ['./app/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--card)',
        muted: 'var(--muted-foreground)',
        border: 'var(--border)',
        destructive: 'var(--destructive)'
      },
      boxShadow: {
        card: '0 16px 44px rgb(23 54 93 / 8%)'
      }
    }
  }
}
