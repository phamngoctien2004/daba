/**
 * Admin Overview Dashboard Components
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, Stethoscope } from 'lucide-react'
import type { DashboardStats } from '../types'

interface StatsCardsProps {
    stats: DashboardStats
    isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
    const cards = [
        {
            title: 'Tổng bệnh nhân',
            value: stats.totalPatients,
            icon: Users,
            description: 'Tổng số bệnh nhân đã đăng ký',
        },
        {
            title: 'Tổng lịch khám',
            value: stats.totalAppointments,
            icon: Calendar,
            description: `Hôm nay: ${stats.todayAppointments}`,
        },
        {
            title: 'Tổng doanh thu',
            value: `${stats.totalRevenue.toLocaleString('vi-VN')} đ`,
            icon: DollarSign,
            description: 'Tổng doanh thu tích lũy',
        },
        {
            title: 'Tổng bác sĩ',
            value: stats.totalDoctors,
            icon: Stethoscope,
            description: 'Đang hoạt động',
        },
    ]

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="h-4 w-24 animate-pulse bg-muted" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-32 animate-pulse bg-muted" />
                            <div className="mt-2 h-3 w-40 animate-pulse bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
