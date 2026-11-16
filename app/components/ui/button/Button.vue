<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/utils/cn'

const varianTombol = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        utama: 'bg-primary text-primary-foreground hover:bg-secondary',
        sekunder: 'border border-border bg-secondary text-secondary-foreground hover:bg-muted',
        aksen: 'bg-accent text-accent-foreground hover:opacity-90',
        bahaya: 'bg-destructive text-destructive-foreground hover:opacity-90',
        garis: 'border border-border bg-card text-foreground hover:bg-muted',
        polos: 'text-foreground hover:bg-muted'
      },
      ukuran: {
        normal: 'min-h-11 px-4 py-2',
        kecil: 'min-h-9 px-3',
        besar: 'min-h-12 px-6',
        ikon: 'size-11 p-0'
      }
    },
    defaultVariants: {
      variant: 'utama',
      ukuran: 'normal'
    }
  }
)

const properti = withDefaults(defineProps<{
  variant?: NonNullable<VariantProps<typeof varianTombol>['variant']>
  ukuran?: NonNullable<VariantProps<typeof varianTombol>['ukuran']>
  type?: 'button' | 'submit' | 'reset'
  class?: string
  disabled?: boolean
}>(), {
  variant: 'utama',
  ukuran: 'normal',
  type: 'button',
  class: '',
  disabled: false
})

const kelas = computed(() => cn(varianTombol({ variant: properti.variant, ukuran: properti.ukuran }), properti.class))
</script>

<template>
  <button :type="properti.type" :class="kelas" :disabled="properti.disabled">
    <slot />
  </button>
</template>
