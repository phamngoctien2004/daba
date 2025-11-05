import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationDropdown } from '@/features/notifications'
import { ThemeSwitch } from '@/components/theme-switch'

/**
 * Standard header actions component
 * Includes: ThemeSwitch, ChatButton, ConfigDrawer, NotificationDropdown, ProfileDropdown
 * Use this in Header components for consistency across pages
 */
export function HeaderActions() {
    return (
        <div className='ms-auto flex items-center gap-1'>
            <ThemeSwitch />
            <ChatButton />
            <ConfigDrawer />
            <NotificationDropdown />
            <ProfileDropdown />
        </div>
    )
}
