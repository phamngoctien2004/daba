import { useMemo } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/auth'

import { getNavGroupsByRole } from './data/role-based-nav'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { AppTitle } from './app-title'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user } = useAuthStore()

  // Get navigation groups based on user role
  const navGroups = useMemo(() => {
    if (!user?.role) {
      console.log('🔴 No user role found, using default sidebar')
      return sidebarData.navGroups // Fallback to default
    }
    console.log('🔵 User role:', user.role, 'Type:', typeof user.role)
    console.log('🔵 UserRole.ADMIN:', UserRole.ADMIN, 'Type:', typeof UserRole.ADMIN)
    const groups = getNavGroupsByRole(user.role as UserRole)
    console.log('🔵 Navigation groups:', groups.map(g => g.title))
    return groups
  }, [user?.role])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
