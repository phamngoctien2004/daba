/**
 * Admin Reports & Statistics Page
 */

import { useState } from 'react'
import { format, subMonths } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationDropdown } from '@/features/notifications'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { DateRangePicker, type DateRange } from './components/date-range-picker'
import { ExportReportButton } from './components/export-button'
import { RevenueCards, PatientCards } from './components/summary-cards'
import {
    RevenueChart,
    AppointmentStatusChart,
    DoctorPerformanceTable,
    PopularServicesTable
} from './components/charts'
import { PatientGenderChart, PatientAgeChart } from './components/patient-charts'
import {
    useDashboardReport
} from './hooks/use-reports'

export default function AdminReportsPage() {
    // Default date range: last month
    const [dateRange, setDateRange] = useState<DateRange>({
        fromDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
        toDate: format(new Date(), 'yyyy-MM-dd'),
    })

    // Fetch dashboard report (all data)
    const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboardReport(dateRange)

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
                        <h2 className='text-2xl font-bold tracking-tight'>Báo cáo & Thống kê</h2>
                        <p className='text-muted-foreground'>Tổng hợp và phân tích dữ liệu hoạt động hệ thống</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <DateRangePicker value={dateRange} onChange={setDateRange} />
                    </div>
                </div>

                {/* Error Alert */}
                {dashboardError && (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertDescription>
                            Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Tabs for different report sections */}
                <Tabs defaultValue='overview' className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <TabsList>
                            <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
                            <TabsTrigger value='revenue'>Doanh thu</TabsTrigger>
                            <TabsTrigger value='appointments'>Lịch khám</TabsTrigger>
                            <TabsTrigger value='patients'>Bệnh nhân</TabsTrigger>
                            <TabsTrigger value='services'>Dịch vụ</TabsTrigger>
                            <TabsTrigger value='doctors'>Bác sĩ</TabsTrigger>
                        </TabsList>
                        <ExportReportButton
                            reportType='revenue'
                            dateRange={dateRange}
                            disabled={!dashboardData}
                        />
                    </div>

                    {/* Overview Tab */}
                    <TabsContent value='overview' className='space-y-4'>
                        <RevenueCards
                            totalRevenue={dashboardData?.revenue.totalRevenue || 0}
                            totalInvoices={dashboardData?.revenue.totalInvoices || 0}
                            totalPaid={dashboardData?.revenue.totalPaid || 0}
                            totalUnpaid={dashboardData?.revenue.totalUnpaid || 0}
                            isLoading={isDashboardLoading}
                        />

                        <PatientCards
                            totalPatients={dashboardData?.patients.totalPatients || 0}
                            totalNewPatients={dashboardData?.patients.totalNewPatients || 0}
                            totalReturningPatients={dashboardData?.patients.totalReturningPatients || 0}
                            isLoading={isDashboardLoading}
                        />

                        <div className='grid gap-4 md:grid-cols-2'>
                            <RevenueChart
                                data={dashboardData?.revenue.revenueByDays || []}
                                isLoading={isDashboardLoading}
                            />
                            <AppointmentStatusChart
                                totalAppointments={dashboardData?.appointments.totalAppointments || 0}
                                confirmedAppointments={dashboardData?.appointments.confirmedAppointments || 0}
                                completedAppointments={dashboardData?.appointments.completedAppointments || 0}
                                cancelledAppointments={dashboardData?.appointments.cancelledAppointments || 0}
                                noShowAppointments={dashboardData?.appointments.noShowAppointments || 0}
                                isLoading={isDashboardLoading}
                            />
                        </div>
                    </TabsContent>

                    {/* Revenue Tab */}
                    <TabsContent value='revenue' className='space-y-4'>
                        <RevenueCards
                            totalRevenue={dashboardData?.revenue.totalRevenue || 0}
                            totalInvoices={dashboardData?.revenue.totalInvoices || 0}
                            totalPaid={dashboardData?.revenue.totalPaid || 0}
                            totalUnpaid={dashboardData?.revenue.totalUnpaid || 0}
                            isLoading={isDashboardLoading}
                        />

                        <div className='grid gap-4 md:grid-cols-2'>
                            <RevenueChart
                                data={dashboardData?.revenue.revenueByDays || []}
                                isLoading={isDashboardLoading}
                            />
                            <AppointmentStatusChart
                                totalAppointments={dashboardData?.appointments.totalAppointments || 0}
                                confirmedAppointments={dashboardData?.appointments.confirmedAppointments || 0}
                                completedAppointments={dashboardData?.appointments.completedAppointments || 0}
                                cancelledAppointments={dashboardData?.appointments.cancelledAppointments || 0}
                                noShowAppointments={dashboardData?.appointments.noShowAppointments || 0}
                                isLoading={isDashboardLoading}
                            />
                        </div>
                    </TabsContent>

                    {/* Appointments Tab */}
                    <TabsContent value='appointments' className='space-y-4'>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <AppointmentStatusChart
                                totalAppointments={dashboardData?.appointments.totalAppointments || 0}
                                confirmedAppointments={dashboardData?.appointments.confirmedAppointments || 0}
                                completedAppointments={dashboardData?.appointments.completedAppointments || 0}
                                cancelledAppointments={dashboardData?.appointments.cancelledAppointments || 0}
                                noShowAppointments={dashboardData?.appointments.noShowAppointments || 0}
                                isLoading={isDashboardLoading}
                            />

                            <DoctorPerformanceTable
                                data={dashboardData?.appointments.appointmentsByDoctor || []}
                                isLoading={isDashboardLoading}
                            />
                        </div>
                    </TabsContent>

                    {/* Patients Tab */}
                    <TabsContent value='patients' className='space-y-4'>
                        <PatientCards
                            totalPatients={dashboardData?.patients.totalPatients || 0}
                            totalNewPatients={dashboardData?.patients.totalNewPatients || 0}
                            totalReturningPatients={dashboardData?.patients.totalReturningPatients || 0}
                            isLoading={isDashboardLoading}
                        />

                        {/* Patient Demographics Charts */}
                        <div className='grid gap-4 md:grid-cols-2'>
                            <PatientGenderChart
                                data={dashboardData?.patients.patientsByGender || []}
                                isLoading={isDashboardLoading}
                            />
                            <PatientAgeChart
                                data={dashboardData?.patients.patientsByAgeGroup || []}
                                isLoading={isDashboardLoading}
                            />
                        </div>
                    </TabsContent>

                    {/* Services Tab */}
                    <TabsContent value='services' className='space-y-4'>
                        <PopularServicesTable
                            data={dashboardData?.services.popularServices || []}
                            isLoading={isDashboardLoading}
                        />
                    </TabsContent>

                    {/* Doctors Tab */}
                    <TabsContent value='doctors' className='space-y-4'>
                        <DoctorPerformanceTable
                            data={dashboardData?.appointments.appointmentsByDoctor || []}
                            isLoading={isDashboardLoading}
                        />
                    </TabsContent>
                </Tabs>
            </Main>
        </>
    )
}
