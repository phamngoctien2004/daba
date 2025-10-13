import { useMemo } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/auth'

import { getNavGroupsByRole } from './data/role-based-nav'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user } = useAuthStore()

  // Get navigation groups based on user role
  const navGroups = useMemo(() => {
    if (!user?.role) {
      return sidebarData.navGroups // Fallback to default
    }
    return getNavGroupsByRole(user.role as UserRole)
  }, [user?.role])

  // Get user data for sidebar footer
  const userData = useMemo(() => {
    if (!user) {
      return sidebarData.user // Fallback to default
    }

    return {
      name: user.doctor?.fullName || user.email.split('@')[0],
      email: user.email,
      avatar: user.doctor?.profileImage || '/avatars/default.jpg',
    }
  }, [user])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
