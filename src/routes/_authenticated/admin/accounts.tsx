/**
 * Admin Accounts Management Route
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

function AdminAccountsPage() {
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
                        <h2 className='text-2xl font-bold tracking-tight'>Quản lý Tài khoản</h2>
                        <p className='text-muted-foreground'>Quản lý người dùng, vai trò và quyền hạn</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quản lý Tài khoản</CardTitle>
                        <CardDescription>Tính năng đang được phát triển</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Module quản lý tài khoản sẽ bao gồm:
                        </p>
                        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
                            <li>Danh sách tài khoản theo vai trò</li>
                            <li>Thêm/sửa/xóa tài khoản</li>
                            <li>Quản lý trạng thái và khóa tài khoản</li>
                            <li>Đổi mật khẩu và reset mật khẩu</li>
                            <li>Quản lý vai trò và phân quyền</li>
                            <li>Xem lịch sử hoạt động và đăng nhập</li>
                            <li>Cảnh báo bảo mật</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quản lý Vai trò & Quyền hạn</CardTitle>
                        <CardDescription>Quản lý phân quyền chi tiết</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                            <li>Danh sách vai trò hệ thống</li>
                            <li>Tạo và chỉnh sửa vai trò</li>
                            <li>Gán quyền hạn cho vai trò</li>
                            <li>Gán vai trò cho người dùng</li>
                            <li>Xem danh sách quyền hạn</li>
                        </ul>
                    </CardContent>
                </Card>
            </Main>
        </>
    )
}

export const Route = createFileRoute('/_authenticated/admin/accounts')({
    component: AdminAccountsPage,
})
