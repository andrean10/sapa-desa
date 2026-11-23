<script setup lang="ts">
import { ChevronsUpDown, KeyRound, LogOut, Moon, Sun } from '@lucide/vue'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { SidebarMenuButton } from '~/components/ui/sidebar'
import { APP_NAME } from '~~/shared/config/app'
import { PERAN_PENGGUNA, TEKS_UMUM } from '~~/shared/config/teks'

const properti = withDefaults(defineProps<{ tampilan?: 'header' | 'sidebar' }>(), { tampilan: 'header' })
defineEmits<{ keluar: [] }>()
const { profil } = useAuth()
const { buka: bukaGantiPassword } = useDialogGantiPassword()
const { gelap, ganti: gantiTema } = useTemaGelap()
const inisial = computed(() => (profil.value?.nama_tampil ?? APP_NAME).split(/\s+/).slice(0, 2).map(kata => kata[0]).join('').toUpperCase())
const labelPeran = computed(() => PERAN_PENGGUNA.find(item => item.value === profil.value?.peran)?.label ?? '')
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <SidebarMenuButton v-if="properti.tampilan === 'sidebar'" size="lg" class="hover:bg-sidebar-foreground/8 data-[state=open]:bg-sidebar-foreground/12">
        <Avatar class="size-8 rounded-lg"><AvatarFallback class="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">{{ inisial }}</AvatarFallback></Avatar>
        <span class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium">{{ profil?.nama_tampil }}</span><span class="truncate text-xs text-sidebar-foreground/65">{{ profil?.username }} · {{ labelPeran }}</span></span>
        <ChevronsUpDown class="ml-auto size-4 opacity-70" />
      </SidebarMenuButton>
      <button v-else type="button" class="flex items-center gap-2 rounded-full p-0.5 transition hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:rounded-lg sm:py-1 sm:pr-2 sm:pl-1" :aria-label="`Menu akun ${profil?.nama_tampil ?? ''}`">
        <Avatar class="size-8 rounded-full sm:rounded-md"><AvatarFallback class="rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:rounded-md">{{ inisial }}</AvatarFallback></Avatar>
        <span class="hidden max-w-40 text-left leading-tight lg:grid"><span class="truncate text-sm font-medium">{{ profil?.nama_tampil }}</span><span class="truncate text-xs text-muted-foreground">{{ labelPeran }}</span></span>
        <ChevronsUpDown class="hidden size-3.5 text-muted-foreground lg:block" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-64 rounded-lg" :side="properti.tampilan === 'sidebar' ? 'right' : 'bottom'" align="end" :side-offset="6">
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="size-8 rounded-lg"><AvatarFallback class="rounded-lg bg-primary text-xs font-semibold text-primary-foreground">{{ inisial }}</AvatarFallback></Avatar>
          <div class="grid flex-1 leading-tight"><span class="truncate font-medium">{{ profil?.nama_tampil }}</span><span class="truncate text-xs text-muted-foreground">{{ profil?.username }}</span></div>
          <span class="rounded-full bg-primary/8 px-2 py-0.5 text-xs font-semibold text-primary">{{ labelPeran }}</span>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem v-if="profil?.peran === 'admin'" @select="bukaGantiPassword"><KeyRound />{{ TEKS_UMUM.gantiPassword }}</DropdownMenuItem>
        <DropdownMenuItem @select="gantiTema"><Sun v-if="gelap" /><Moon v-else />{{ gelap ? 'Mode terang' : 'Mode gelap' }}</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="text-destructive focus:bg-bahaya-muda focus:text-destructive" @select="$emit('keluar')"><LogOut class="text-destructive" />{{ TEKS_UMUM.keluar }}</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
