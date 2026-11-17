<script setup lang="ts">
import { ListFilter } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { STATUS_LAPORAN_TAMPILAN } from '~~/shared/config/teks'

const terpilih = defineModel<string[]>({ required: true })
function ubah(status: string, aktif: boolean) {
  terpilih.value = aktif ? [...new Set([...terpilih.value, status])] : terpilih.value.filter(item => item !== status)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="h-9 border-dashed bg-card">
        <ListFilter class="size-4" />Status
        <span v-if="terpilih.length" class="rounded-md bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">{{ terpilih.length }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-56">
      <DropdownMenuLabel>Status laporan</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem v-for="item in STATUS_LAPORAN_TAMPILAN" :key="item.value" :model-value="terpilih.includes(item.value)" @update:model-value="(aktif: boolean) => ubah(item.value, aktif)" @select.prevent>
        <span class="size-2 rounded-full" :style="{ backgroundColor: item.warna.teks }" aria-hidden="true" />{{ item.label }}
      </DropdownMenuCheckboxItem>
      <template v-if="terpilih.length">
        <DropdownMenuSeparator />
        <DropdownMenuItem class="justify-center text-muted-foreground" @select="terpilih = []">Hapus pilihan status</DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
