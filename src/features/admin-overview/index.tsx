/**
 * Admin Overview Dashboard Page
 */

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { StatsCards } from './components/stats-cards'
import { useDashboardOverview } from './hooks/use-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function AdminOverviewPage() {
    const { data, isLoading, error } = useDashboardOverview()

    if (error) {
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
                            <h2 className='text-2xl font-bold tracking-tight'>Dashboard Tổng quan</h2>
                            <p className='text-muted-foreground'>Thống kê và báo cáo tổng hợp hệ thống</p>
                        </div>
                    </div>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.
                        </AlertDescription>
                    </Alert>
                </Main>
            </>
        )
    }

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
                        <h2 className='text-2xl font-bold tracking-tight'>Dashboard Tổng quan</h2>
                        <p className='text-muted-foreground'>Thống kê và báo cáo tổng hợp hệ thống</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <StatsCards stats={data?.stats || ({} as any)} isLoading={isLoading} />

                {/* Appointment Status */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-8 w-16 animate-pulse bg-muted" />
                                ) : (
                                    data?.stats.pendingAppointments || 0
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-8 w-16 animate-pulse bg-muted" />
                                ) : (
                                    data?.stats.completedAppointments || 0
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-8 w-16 animate-pulse bg-muted" />
                                ) : (
                                    data?.stats.cancelledAppointments || 0
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-8 w-16 animate-pulse bg-muted" />
                                ) : (
                                    data?.stats.todayAppointments || 0
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Doanh thu theo tháng</CardTitle>
                            <CardDescription>Biểu đồ doanh thu 12 tháng gần nhất</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-64 w-full animate-pulse bg-muted" />
                            ) : (
                                <div className="flex h-64 items-center justify-center text-muted-foreground">
                                    Biểu đồ sẽ được hiển thị ở đây (cần tích hợp thư viện chart)
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tình trạng lịch khám</CardTitle>
                            <CardDescription>Phân bố theo trạng thái</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-64 w-full animate-pulse bg-muted" />
                            ) : (
                                <div className="flex h-64 items-center justify-center text-muted-foreground">
                                    Biểu đồ sẽ được hiển thị ở đây (cần tích hợp thư viện chart)
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Top Services & Doctor Performance */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dịch vụ phổ biến</CardTitle>
                            <CardDescription>Top 5 dịch vụ được sử dụng nhiều nhất</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-12 w-full animate-pulse bg-muted" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data?.topServices?.slice(0, 5).map((service, index) => (
                                        <div key={service.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{service.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {service.count} lượt
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">
                                                    {service.revenue.toLocaleString('vi-VN')} đ
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hiệu suất bác sĩ</CardTitle>
                            <CardDescription>Top 5 bác sĩ có nhiều lịch khám nhất</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-12 w-full animate-pulse bg-muted" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data?.doctorPerformance?.slice(0, 5).map((doctor, index) => (
                                        <div key={doctor.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{doctor.name}</div>
                                                    <div className="text-sm text-muted-foreground">{doctor.department}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{doctor.totalAppointments} lịch</div>
                                                <div className="text-sm text-muted-foreground">
                                                    ⭐ {doctor.rating.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Main>
        </>
    )
}
