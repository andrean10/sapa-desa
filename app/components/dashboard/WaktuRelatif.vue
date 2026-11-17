<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { formatRelatifWib, formatTanggalWaktuWib } from '~~/shared/utils/waktu'

defineProps<{ waktu: string }>()
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child><time :datetime="waktu" class="cursor-help whitespace-nowrap underline decoration-border decoration-dotted underline-offset-4" tabindex="0">{{ formatRelatifWib(waktu) }}</time></TooltipTrigger>
    <TooltipContent>{{ formatTanggalWaktuWib(waktu) }}</TooltipContent>
  </Tooltip>
</template>
