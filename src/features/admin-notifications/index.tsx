/**
 * Admin Notifications Management Page
 */

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationDropdown } from '@/features/notifications'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { NotificationsTable } from './components/notifications-table'
import { NotificationFormDialog } from './components/notification-form-dialog'
import { NotificationDetailDialog } from './components/notification-detail-dialog'
import { useNotifications } from './hooks/use-notifications'
import type { Notification } from './types'

export default function AdminNotificationsPage() {
    const [page, setPage] = useState(0)
    const [formOpen, setFormOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

    const { data, isLoading, error } = useNotifications({ page, size: 10 })

    const handleEdit = (notification: Notification) => {
        setSelectedNotification(notification)
        setFormOpen(true)
    }

    const handleView = (notification: Notification) => {
        setSelectedNotification(notification)
        setDetailOpen(true)
    }

    const handleCreate = () => {
        setSelectedNotification(null)
        setFormOpen(true)
    }

    const handleCloseForm = () => {
        setFormOpen(false)
        setSelectedNotification(null)
    }

    const handleCloseDetail = () => {
        setDetailOpen(false)
        setSelectedNotification(null)
    }

    return (
        <>
            <Header fixed>
                <GlobalSearch />
                <div className='ms-auto flex items-center gap-1'>
                    <ThemeSwitch />
                    <ChatButton />
                    <ConfigDrawer />
                    <NotificationDropdown />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                {/* Page Header */}
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Quản lý Thông báo</h2>
                        <p className='text-muted-foreground'>
                            Tạo và quản lý thông báo gửi đến người dùng
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className='mr-2 h-4 w-4' />
                        Tạo thông báo mới
                    </Button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertDescription>
                            Không thể tải danh sách thông báo. Vui lòng thử lại sau.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Notifications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách Thông báo</CardTitle>
                        <CardDescription>
                            {data?.totalElements || 0} thông báo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <NotificationsTable
                            data={data?.content || []}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onView={handleView}
                        />

                        {/* Pagination */}
                        {data && data.totalPages > 1 && (
                            <div className='mt-4 flex items-center justify-between'>
                                <p className='text-sm text-muted-foreground'>
                                    Trang {page + 1} / {data.totalPages}
                                </p>
                                <div className='flex gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 0}
                                    >
                                        Trước
                                    </Button>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= data.totalPages - 1}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Main>

            {/* Form Dialog */}
            <NotificationFormDialog
                open={formOpen}
                onOpenChange={handleCloseForm}
                notification={selectedNotification}
            />

            {/* Detail Dialog */}
            <NotificationDetailDialog
                open={detailOpen}
                onOpenChange={handleCloseDetail}
                notification={selectedNotification}
            />
        </>
    )
}
