import { Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, useMarkAsRead } from '../hooks/use-notifications'
import { cn } from '@/lib/utils'
import type { Notification } from '../types'

export function NotificationDropdown() {
    const { data, isLoading, dataUpdatedAt } = useNotifications()
    const { mutate: markAsRead } = useMarkAsRead()

    const notifications = data?.data?.notifications || []
    const unreadCount = data?.data?.unreadCount || 0

    // Debug log to track updates
    console.log('🔔 [NotificationDropdown] Render:', {
        unreadCount,
        notificationsCount: notifications.length,
        dataUpdatedAt: new Date(dataUpdatedAt).toISOString(),
    })

    // Filter only notifications that admin hasn't read
    const unreadNotifications = notifications.filter((n) => !n.isAdminRead)

    const handleOpenChange = (open: boolean) => {
        // When opening dropdown, mark all notifications as read
        if (open && unreadCount > 0) {
            markAsRead()
        }
    }

    const formatNotificationTime = (time: string) => {
        try {
            return formatDistanceToNow(new Date(time), {
                addSuffix: true,
                locale: vi,
            })
        } catch {
            return time
        }
    }

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'DAT_LICH':
                return '📅'
            case 'HUY_LICH':
                return '❌'
            case 'XAC_NHAN_LICH':
                return '✅'
            default:
                return '🔔'
        }
    }

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon'
                    className='relative h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors'
                >
                    <Bell className='h-5 w-5' />
                    {unreadCount > 0 && (
                        <Badge
                            variant='destructive'
                            className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-80' align='end' forceMount>
                <DropdownMenuLabel className='font-semibold'>
                    Thông báo
                    {unreadCount > 0 && (
                        <span className='ml-2 text-muted-foreground text-xs font-normal'>
                            ({unreadCount} chưa đọc)
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className='p-4 text-center text-sm text-muted-foreground'>
                        Đang tải...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className='p-4 text-center text-sm text-muted-foreground'>
                        Không có thông báo
                    </div>
                ) : (
                    <ScrollArea className='h-[400px]'>
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    'flex flex-col items-start gap-1 p-3 cursor-pointer',
                                    !notification.isAdminRead && 'bg-accent/50'
                                )}
                            >
                                <div className='flex items-start gap-2 w-full'>
                                    <span className='text-xl flex-shrink-0'>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className='flex-1 min-w-0'>
                                        <p
                                            className={cn(
                                                'text-sm leading-tight',
                                                !notification.isAdminRead && 'font-semibold'
                                            )}
                                        >
                                            {notification.title}
                                        </p>
                                        <p className='text-xs text-muted-foreground mt-1'>
                                            {formatNotificationTime(notification.time)}
                                        </p>
                                    </div>
                                    {!notification.isAdminRead && (
                                        <div className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1' />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                )}

                {unreadNotifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className='p-2'>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='w-full text-xs'
                                onClick={() => markAsRead()}
                            >
                                Đánh dấu tất cả đã đọc
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
