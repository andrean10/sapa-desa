<script setup lang="ts">
import { Activity, BookOpenText, Building2, ChartNoAxesCombined, ClipboardList, FileText, LayoutDashboard, MapPinned, Settings, ShieldCheck, Users } from '@lucide/vue'
import type { LucideIcon } from '@lucide/vue'
import { APP_NAME, MENU_PERAN } from '~~/shared/config/app'
import { LABEL_MENU } from '~~/shared/config/teks'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '~/components/ui/sidebar'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'

const props = withDefaults(defineProps<{ collapsible?: 'offcanvas' | 'icon' | 'none'; side?: 'left' | 'right'; variant?: 'sidebar' | 'floating' | 'inset' }>(), { collapsible: 'icon', side: 'left', variant: 'sidebar' })
const { profil } = useAuth()
const route = useRoute()
const icons: Record<string, LucideIcon> = { Dashboard: LayoutDashboard, 'Laporan Masyarakat': FileText, 'Laporan Kegiatan': ClipboardList, Pegawai: Users, 'Profil Kantor': Building2, Peringkat: ChartNoAxesCombined, Pantauan: Activity, 'Desa Binaan': MapPinned, 'Penugasan PIMPASA': ClipboardList, 'Wilayah Kerja': MapPinned, FAQ: BookOpenText, Pengaturan: Settings, 'Status sistem': ShieldCheck, Akun: Users }
const items = computed(() => MENU_PERAN[profil.value?.peran ?? 'upt'].filter(item => !item.href.startsWith('/admin')))
const itemPemantauan = computed(() => items.value.filter(item => ['/upt', '/upt/laporan', '/upt/kegiatan', '/kanwil', '/kanwil/peringkat', '/kanwil/pantauan', '/kanwil/laporan', '/kanwil/kegiatan'].includes(item.href)))
const itemPengelolaan = computed(() => items.value.filter(item => !itemPemantauan.value.some(pantauan => pantauan.href === item.href)))
const itemsAdmin = computed(() => profil.value?.peran === 'admin' ? MENU_PERAN.admin.filter(item => item.href.startsWith('/admin')) : [])
const initials = computed(() => (profil.value?.nama_tampil ?? APP_NAME).split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase())
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader class="border-t-4 border-t-sidebar-primary border-b border-sidebar-border/60 px-3 py-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/" class="min-w-0">
              <img class="size-9 shrink-0 object-contain" src="/images/logo.webp" alt="" width="36" height="36">
              <span class="grid min-w-0 flex-1 text-left text-sm leading-tight"><span class="truncate font-semibold">{{ APP_NAME }}</span><span class="truncate text-xs">Pelayanan Keimigrasian Riau</span></span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup class="px-2 py-3">
        <SidebarGroupLabel class="px-2 text-[0.68rem] font-semibold uppercase tracking-wider">{{ profil?.peran === 'upt' ? 'Operasional' : 'Pemantauan' }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in itemPemantauan" :key="item.href">
            <SidebarMenuButton class="relative data-[active=true]:before:absolute data-[active=true]:before:inset-y-2 data-[active=true]:before:left-0 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full data-[active=true]:before:bg-sidebar-primary" as-child :is-active="route.path === item.href || (item.href !== '/upt' && item.href !== '/kanwil' && route.path.startsWith(`${item.href}/`))" :tooltip="item.label">
              <NuxtLink :to="item.href"><component :is="icons[item.label] ?? FileText" /><span>{{ item.label }}</span></NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup v-if="itemPengelolaan.length" class="px-2 py-1">
        <SidebarGroupLabel class="px-2 text-[0.68rem] font-semibold uppercase tracking-wider">Pengelolaan</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in itemPengelolaan" :key="item.href">
            <SidebarMenuButton class="relative data-[active=true]:before:absolute data-[active=true]:before:inset-y-2 data-[active=true]:before:left-0 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full data-[active=true]:before:bg-sidebar-primary" as-child :is-active="route.path === item.href || (item.href !== '/upt' && item.href !== '/kanwil' && route.path.startsWith(`${item.href}/`))" :tooltip="item.label">
              <NuxtLink :to="item.href"><component :is="icons[item.label] ?? FileText" /><span>{{ item.label }}</span></NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup v-if="itemsAdmin.length" class="px-2 py-1">
        <SidebarGroupLabel class="px-2 text-[0.68rem] font-semibold uppercase tracking-wider">Admin</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in itemsAdmin" :key="item.href">
            <SidebarMenuButton class="relative data-[active=true]:before:absolute data-[active=true]:before:inset-y-2 data-[active=true]:before:left-0 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full data-[active=true]:before:bg-sidebar-primary" as-child :is-active="route.path === item.href || route.path.startsWith(`${item.href}/`)" :tooltip="item.label">
              <NuxtLink :to="item.href"><component :is="icons[item.label] ?? FileText" /><span>{{ item.label }}</span></NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter class="border-t border-sidebar-border/60 p-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/akun/password">
              <Avatar class="size-8 rounded-lg"><AvatarFallback class="rounded-lg">{{ initials }}</AvatarFallback></Avatar>
              <span class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium">{{ profil?.nama_tampil }}</span><span class="truncate text-xs">{{ LABEL_MENU.akun }} · {{ profil?.peran }}</span></span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
