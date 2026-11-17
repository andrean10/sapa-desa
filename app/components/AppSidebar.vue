<script setup lang="ts">
import { Activity, BookOpenText, Building2, ChartNoAxesCombined, ClipboardList, FileText, LayoutDashboard, Map as IkonPeta, MapPinned, Settings, ShieldCheck, UserRoundCog, Users } from '@lucide/vue'
import type { LucideIcon } from '@lucide/vue'
import { APP_NAME } from '~~/shared/config/app'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '~/components/ui/sidebar'

const props = withDefaults(defineProps<{ collapsible?: 'offcanvas' | 'icon' | 'none'; side?: 'left' | 'right'; variant?: 'sidebar' | 'floating' | 'inset'; namaPetugas?: string }>(), { collapsible: 'icon', side: 'left', variant: 'sidebar', namaPetugas: '' })
defineEmits<{ keluar: [] }>()
const { profil } = useAuth()
const route = useRoute()
const IKON: Record<string, LucideIcon> = {
  '/upt': LayoutDashboard, '/kanwil': LayoutDashboard, '/upt/laporan': FileText, '/kanwil/laporan': FileText, '/upt/kegiatan': ClipboardList, '/kanwil/kegiatan': ClipboardList,
  '/upt/pegawai': Users, '/upt/profil': Building2, '/kanwil/peringkat': ChartNoAxesCombined, '/kanwil/pantauan': Activity, '/kanwil/desa-binaan': MapPinned,
  '/kanwil/penugasan': UserRoundCog, '/kanwil/wilayah-kerja': IkonPeta, '/kanwil/faq': BookOpenText, '/kanwil/pengaturan': Settings, '/admin/status': ShieldCheck, '/admin/akun': Users
}
const grup = computed(() => kelompokMenu(profil.value?.peran ?? 'upt'))
const sidebarProps = computed(() => ({ collapsible: props.collapsible, side: props.side, variant: props.variant }))
</script>

<template>
  <Sidebar v-bind="sidebarProps">
    <SidebarHeader class="px-3 pt-4 pb-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child class="hover:bg-sidebar-foreground/8">
            <NuxtLink :to="profil?.peran === 'upt' ? '/upt' : '/kanwil'" class="min-w-0 no-underline">
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-sidebar-primary/60"><img class="size-full object-contain" src="/images/logo.webp" alt="" width="36" height="36"></span>
              <span class="grid min-w-0 flex-1 text-left leading-tight"><span class="truncate text-sm font-bold tracking-wide">{{ APP_NAME }}</span><span class="truncate text-xs text-sidebar-foreground/65">Keimigrasian Riau</span></span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <div class="mx-4 h-px bg-linear-to-r from-sidebar-primary/70 via-sidebar-primary/25 to-transparent group-data-[collapsible=icon]:mx-2" aria-hidden="true" />
    <SidebarContent class="gap-0 py-2">
      <SidebarGroup v-for="item in grup" :key="item.label" class="px-2 py-1.5">
        <SidebarGroupLabel class="px-2 text-[0.68rem] font-semibold tracking-[0.12em] text-sidebar-foreground/50 uppercase">{{ item.label }}</SidebarGroupLabel>
        <SidebarMenu class="gap-0.5">
          <SidebarMenuItem v-for="menu in item.items" :key="menu.href">
            <SidebarMenuButton
              as-child
              :is-active="menuCocok(route.path, menu.href)"
              :tooltip="menu.label"
              class="relative h-9 text-sidebar-foreground/80 hover:bg-sidebar-foreground/8 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-foreground/12 data-[active=true]:text-sidebar-foreground data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-full data-[active=true]:before:bg-sidebar-primary [&[data-active=true]>svg]:text-sidebar-primary"
            >
              <NuxtLink :to="menu.href" class="no-underline"><component :is="IKON[menu.href] ?? FileText" /><span>{{ menu.label }}</span></NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter class="border-t border-sidebar-foreground/10 p-2">
      <SidebarMenu><SidebarMenuItem><MenuPengguna tampilan="sidebar" :nama-petugas="namaPetugas" @keluar="$emit('keluar')" /></SidebarMenuItem></SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
