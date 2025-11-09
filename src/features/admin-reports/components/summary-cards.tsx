/**
 * Summary Cards Component
 */

import { DollarSign, Calendar, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SummaryCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    description?: string
    trend?: {
        value: number
        isPositive: boolean
    }
    isLoading?: boolean
}

function SummaryCard({ title, value, icon, description, trend, isLoading }: SummaryCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                    {icon}
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-8 w-24' />
                    {description && <Skeleton className='h-4 w-32 mt-2' />}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold'>{value}</div>
                {description && <p className='text-xs text-muted-foreground mt-1'>{description}</p>}
                {trend && (
                    <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}% so với kỳ trước
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

interface RevenueCardsProps {
    totalRevenue: number
    totalInvoices: number
    totalPaid: number
    totalUnpaid: number
    isLoading?: boolean
}

export function RevenueCards({ totalRevenue, totalInvoices, totalPaid, totalUnpaid, isLoading }: RevenueCardsProps) {
    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <SummaryCard
                title='Tổng Doanh Thu'
                value={totalRevenue.toLocaleString('vi-VN') + ' ₫'}
                icon={<DollarSign className='h-4 w-4 text-muted-foreground' />}
                isLoading={isLoading}
            />
            <SummaryCard
                title='Số Hóa Đơn'
                value={totalInvoices}
                icon={<Calendar className='h-4 w-4 text-muted-foreground' />}
                description='Tổng số hóa đơn'
                isLoading={isLoading}
            />
            <SummaryCard
                title='Đã Thanh Toán'
                value={totalPaid.toLocaleString('vi-VN') + ' ₫'}
                icon={<TrendingUp className='h-4 w-4 text-green-600' />}
                isLoading={isLoading}
            />
            <SummaryCard
                title='Chưa Thanh Toán'
                value={totalUnpaid.toLocaleString('vi-VN') + ' ₫'}
                icon={<TrendingUp className='h-4 w-4 text-red-600' />}
                isLoading={isLoading}
            />
        </div>
    )
}

interface AppointmentCardsProps {
    totalAppointments: number
    confirmedAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    isLoading?: boolean
}

export function AppointmentCards({
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    isLoading
}: AppointmentCardsProps) {
    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <SummaryCard
                title='Tổng Lịch Khám'
                value={totalAppointments}
                icon={<Calendar className='h-4 w-4 text-muted-foreground' />}
                isLoading={isLoading}
            />
            <SummaryCard
                title='Đã Xác Nhận'
                value={confirmedAppointments}
                icon={<Calendar className='h-4 w-4 text-blue-600' />}
                isLoading={isLoading}
            />
            <SummaryCard
                title='Hoàn Thành'
                value={completedAppointments}
                icon={<Calendar className='h-4 w-4 text-green-600' />}
                isLoading={isLoading}
            />
            <SummaryCard
                title='Đã Hủy'
                value={cancelledAppointments}
                icon={<Calendar className='h-4 w-4 text-red-600' />}
                isLoading={isLoading}
            />
        </div>
    )
}

interface PatientCardsProps {
    totalPatients: number
    totalNewPatients: number
    totalReturningPatients: number
    isLoading?: boolean
}

export function PatientCards({
    totalPatients,
    totalNewPatients,
    totalReturningPatients,
    isLoading
}: PatientCardsProps) {
    return (
        <div className='grid gap-4 md:grid-cols-3'>
            <SummaryCard
                title='Tổng Bệnh Nhân'
                value={totalPatients}
                icon={<Users className='h-4 w-4 text-muted-foreground' />}
                isLoading={isLoading}
            />
            <SummaryCard
                title='Bệnh Nhân Mới'
                value={totalNewPatients}
                icon={<Users className='h-4 w-4 text-green-600' />}
                isLoading={isLoading}
            />
            <SummaryCard
                title='Bệnh Nhân Tái Khám'
                value={totalReturningPatients}
                icon={<Users className='h-4 w-4 text-blue-600' />}
                isLoading={isLoading}
            />
        </div>
    )
}
