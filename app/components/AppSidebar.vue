<script setup lang="ts">
import { Home, FileText, ClipboardList, Users, Building2, LayoutDashboard, MapPinned, ChartNoAxesCombined, Settings, ShieldCheck } from '@lucide/vue'
import type { LucideIcon } from '@lucide/vue'
import { APP_NAME, MENU_PERAN } from '~~/shared/config/app'
import { LABEL_MENU, TEKS_UMUM } from '~~/shared/config/teks'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '~/components/ui/sidebar'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'

const props = withDefaults(defineProps<{ collapsible?: 'offcanvas' | 'icon' | 'none'; side?: 'left' | 'right'; variant?: 'sidebar' | 'floating' | 'inset' }>(), { collapsible: 'icon' })
const { profil } = useAuth()
const route = useRoute()
const icons: Record<string, LucideIcon> = { Dashboard: LayoutDashboard, 'Laporan Masyarakat': FileText, 'Laporan Kegiatan': ClipboardList, Pegawai: Users, 'Profil Kantor': Building2, Peringkat: ChartNoAxesCombined, Pantauan: Home, 'Desa Binaan': MapPinned, 'Penugasan PIMPASA': ClipboardList, 'Wilayah Kerja': MapPinned, FAQ: FileText, Pengaturan: Settings, 'Status sistem': ShieldCheck, Akun: Users }
const items = computed(() => MENU_PERAN[profil.value?.peran ?? 'upt'].filter(item => !item.href.startsWith('/admin')))
const itemsAdmin = computed(() => profil.value?.peran === 'admin' ? MENU_PERAN.admin.filter(item => item.href.startsWith('/admin')) : [])
const initials = computed(() => (profil.value?.nama_tampil ?? APP_NAME).split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase())
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <span class="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">SD</span>
              <span class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-semibold">{{ APP_NAME }}</span><span class="truncate text-xs">Pelayanan Keimigrasian Riau</span></span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>{{ TEKS_UMUM.navigasiUtama }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in items" :key="item.href">
            <SidebarMenuButton as-child :is-active="route.path === item.href || (item.href !== '/upt' && item.href !== '/kanwil' && route.path.startsWith(`${item.href}/`))" :tooltip="item.label">
              <NuxtLink :to="item.href"><component :is="icons[item.label] ?? FileText" /><span>{{ item.label }}</span></NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup v-if="itemsAdmin.length">
        <SidebarGroupLabel>Admin</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in itemsAdmin" :key="item.href">
            <SidebarMenuButton as-child :is-active="route.path === item.href || route.path.startsWith(`${item.href}/`)" :tooltip="item.label">
              <NuxtLink :to="item.href"><component :is="icons[item.label] ?? FileText" /><span>{{ item.label }}</span></NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
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
