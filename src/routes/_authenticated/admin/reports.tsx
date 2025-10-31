/**
 * Admin Reports & Analytics Route
 */

import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function AdminReportsPage() {
    return (
        <>
            <Header fixed>
                <GlobalSearch />
                <div className='ms-auto flex items-center gap-1'>
                    <ThemeSwitch />
                    <ChatButton />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Báo cáo & Thống kê</h2>
                        <p className='text-muted-foreground'>Tạo và xem các báo cáo chi tiết về hoạt động hệ thống</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Báo cáo & Thống kê</CardTitle>
                        <CardDescription>Tính năng đang được phát triển</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Module báo cáo và thống kê sẽ bao gồm:
                        </p>
                        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
                            <li>Báo cáo doanh thu theo thời gian</li>
                            <li>Báo cáo lịch khám theo bác sĩ, khoa</li>
                            <li>Báo cáo bệnh nhân mới/tái khám</li>
                            <li>Thống kê hiệu suất bác sĩ</li>
                            <li>Thống kê dịch vụ phổ biến</li>
                            <li>Xuất báo cáo PDF/Excel</li>
                        </ul>
                    </CardContent>
                </Card>
            </Main>
        </>
    )
}

export const Route = createFileRoute('/_authenticated/admin/reports')({
    component: AdminReportsPage,
})
