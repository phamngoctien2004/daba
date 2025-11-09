/**
 * Chart Components for Reports
 * Using Recharts for beautiful visualizations
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import type { RevenueByDay, AppointmentByDoctor, PopularService } from '../types'

interface RevenueChartProps {
    data: RevenueByDay[]
    isLoading?: boolean
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Doanh Thu Theo Ngày</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-80 w-full' />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Doanh Thu Theo Ngày</CardTitle>
                    <CardDescription>Không có dữ liệu trong khoảng thời gian này</CardDescription>
                </CardHeader>
                <CardContent className='h-80 flex items-center justify-center'>
                    <p className='text-muted-foreground'>Chưa có dữ liệu</p>
                </CardContent>
            </Card>
        )
    }

    // Determine interval based on data length
    const dataLength = data.length
    let displayData = data
    let tickInterval = 0

    if (dataLength > 60) {
        // > 2 months: show every 7 days
        displayData = data.filter((_, index) => index % 7 === 0)
        tickInterval = 0
    } else if (dataLength > 30) {
        // > 1 month: show every 3 days
        displayData = data.filter((_, index) => index % 3 === 0)
        tickInterval = 0
    } else {
        // <= 1 month: show all
        displayData = data
        tickInterval = dataLength > 15 ? 2 : 0
    }

    const chartData = displayData.map((item) => ({
        date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: item.revenue,
        invoiceCount: item.invoiceCount,
    }))

    const maxRevenue = Math.max(...displayData.map(d => d.revenue), 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Doanh Thu Theo Ngày</CardTitle>
                <CardDescription>
                    Biểu đồ doanh thu ({data.length} ngày)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width='100%' height={350}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                                <stop offset='95%' stopColor='#10b981' stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis
                            dataKey='date'
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            interval={tickInterval}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => {
                                if (maxRevenue >= 1000000) {
                                    return `${(value / 1000000).toFixed(1)}M`
                                } else if (maxRevenue >= 1000) {
                                    return `${(value / 1000).toFixed(0)}K`
                                }
                                return value.toString()
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            labelStyle={{ color: '#111827', fontWeight: 600 }}
                            formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                        />
                        <Area
                            type='monotone'
                            dataKey='revenue'
                            stroke='#10b981'
                            strokeWidth={2}
                            fillOpacity={1}
                            fill='url(#colorRevenue)'
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface AppointmentStatusChartProps {
    totalAppointments: number
    confirmedAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    noShowAppointments: number
    isLoading?: boolean
}

const APPOINTMENT_STATUS_COLORS = {
    'Đã xác nhận': '#3b82f6',    // Blue
    'Hoàn thành': '#10b981',      // Green
    'Đã hủy': '#ef4444',          // Red
    'Không đến': '#f59e0b',       // Orange
}

export function AppointmentStatusChart({
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    isLoading
}: AppointmentStatusChartProps) {
    console.log('🟢 [AppointmentStatusChart] Props:', {
        totalAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
    })

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Trạng Thái Lịch Khám</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-80 w-full' />
                </CardContent>
            </Card>
        )
    }

    const chartData = [
        { name: 'Đã xác nhận', value: confirmedAppointments, color: APPOINTMENT_STATUS_COLORS['Đã xác nhận'] },
        { name: 'Hoàn thành', value: completedAppointments, color: APPOINTMENT_STATUS_COLORS['Hoàn thành'] },
        { name: 'Đã hủy', value: cancelledAppointments, color: APPOINTMENT_STATUS_COLORS['Đã hủy'] },
        { name: 'Không đến', value: noShowAppointments, color: APPOINTMENT_STATUS_COLORS['Không đến'] },
    ]

    console.log('🟢 [AppointmentStatusChart] Chart data:', chartData)

    const hasData = chartData.some(item => item.value > 0)

    if (!hasData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Trạng Thái Lịch Khám</CardTitle>
                    <CardDescription>Không có dữ liệu</CardDescription>
                </CardHeader>
                <CardContent className='h-80 flex items-center justify-center'>
                    <p className='text-muted-foreground'>Chưa có lịch khám</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trạng Thái Lịch Khám</CardTitle>
                <CardDescription>Phân bố trạng thái của {totalAppointments} lịch khám</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='mb-6 grid grid-cols-2 gap-3'>
                    {chartData.map((item) => {
                        const percentage = totalAppointments > 0 ? (item.value / totalAppointments) * 100 : 0
                        return (
                            <div key={item.name} className='space-y-1'>
                                <div className='flex items-center justify-between text-sm'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                                        <span className='font-medium'>{item.name}</span>
                                    </div>
                                    <span className='text-muted-foreground'>{percentage.toFixed(1)}%</span>
                                </div>
                                <div className='text-xs text-muted-foreground'>{item.value} lịch khám</div>
                            </div>
                        )
                    })}
                </div>
                <ResponsiveContainer width='100%' height={350}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx='50%'
                            cy='50%'
                            labelLine={false}
                            outerRadius={120}
                            fill='#8884d8'
                            dataKey='value'
                            label={({ name, percent, value }: any) => {
                                if (value === 0) return ''
                                return `${name} (${(percent * 100).toFixed(0)}%)`
                            }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: number) => [`${value} lịch khám`, 'Số lượng']}
                        />
                        <Legend
                            verticalAlign='bottom'
                            height={36}
                            iconType='circle'
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface DoctorPerformanceTableProps {
    data: AppointmentByDoctor[]
    isLoading?: boolean
}

export function DoctorPerformanceTable({ data, isLoading }: DoctorPerformanceTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thống Kê Theo Bác Sĩ</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-80 w-full' />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thống Kê Theo Bác Sĩ</CardTitle>
                    <CardDescription>Không có dữ liệu</CardDescription>
                </CardHeader>
                <CardContent className='h-80 flex items-center justify-center'>
                    <p className='text-muted-foreground'>Chưa có dữ liệu</p>
                </CardContent>
            </Card>
        )
    }

    // Prepare data for bar chart - top 10 doctors
    const topDoctors = data.slice(0, 10)
    const chartData = topDoctors.map((doctor) => ({
        name: doctor.doctorName.replace('BS. ', '').replace('Bs. ', ''),
        'Hoàn thành': doctor.completedAppointments,
        'Đã hủy': doctor.cancelledAppointments,
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Thống Kê Lịch Khám Theo Bác Sĩ</CardTitle>
                <CardDescription>Top {topDoctors.length} bác sĩ có nhiều lịch khám nhất</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width='100%' height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis
                            dataKey='name'
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            angle={-45}
                            textAnchor='end'
                            height={100}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            labelStyle={{ color: '#111827', fontWeight: 600 }}
                        />
                        <Legend />
                        <Bar dataKey='Hoàn thành' fill='#10b981' radius={[4, 4, 0, 0]} />
                        <Bar dataKey='Đã hủy' fill='#ef4444' radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>

                {/* Detailed Table */}
                <div className='mt-6 overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='border-b'>
                                <th className='text-left py-2 px-2'>Bác sĩ</th>
                                <th className='text-left py-2 px-2'>Khoa</th>
                                <th className='text-right py-2 px-2'>Tổng</th>
                                <th className='text-right py-2 px-2'>Hoàn thành</th>
                                <th className='text-right py-2 px-2'>Đã hủy</th>
                                <th className='text-right py-2 px-2'>Tỷ lệ HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDoctors.map((doctor) => {
                                const completionRate = doctor.totalAppointments > 0
                                    ? (doctor.completedAppointments / doctor.totalAppointments) * 100
                                    : 0
                                return (
                                    <tr key={doctor.doctorId} className='border-b hover:bg-muted/50'>
                                        <td className='py-2 px-2 font-medium'>{doctor.doctorName}</td>
                                        <td className='py-2 px-2 text-muted-foreground'>{doctor.departmentName}</td>
                                        <td className='text-right py-2 px-2'>{doctor.totalAppointments}</td>
                                        <td className='text-right py-2 px-2'>
                                            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                                                {doctor.completedAppointments}
                                            </span>
                                        </td>
                                        <td className='text-right py-2 px-2'>
                                            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
                                                {doctor.cancelledAppointments}
                                            </span>
                                        </td>
                                        <td className='text-right py-2 px-2 font-semibold'>{completionRate.toFixed(1)}%</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

interface PopularServicesTableProps {
    data: PopularService[]
    isLoading?: boolean
}

export function PopularServicesTable({ data, isLoading }: PopularServicesTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Dịch Vụ Phổ Biến</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-80 w-full' />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Dịch Vụ Phổ Biến</CardTitle>
                    <CardDescription>Không có dữ liệu</CardDescription>
                </CardHeader>
                <CardContent className='h-80 flex items-center justify-center'>
                    <p className='text-muted-foreground'>Chưa có dữ liệu</p>
                </CardContent>
            </Card>
        )
    }

    // Prepare data for horizontal bar chart - top 10 services
    const topServices = data.slice(0, 10)
    const chartData = topServices.map((service) => ({
        name: service.serviceName.length > 35
            ? service.serviceName.substring(0, 35) + '...'
            : service.serviceName,
        fullName: service.serviceName,
        'Số lần sử dụng': service.usageCount,
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dịch Vụ Phổ Biến</CardTitle>
                <CardDescription>Top {topServices.length} dịch vụ được sử dụng nhiều nhất</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width='100%' height={400}>
                    <BarChart data={chartData} layout='vertical'>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis
                            type='number'
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis
                            type='category'
                            dataKey='name'
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            width={180}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            labelStyle={{ color: '#111827', fontWeight: 600 }}
                        />
                        <Legend />
                        <Bar dataKey='Số lần sử dụng' fill='#3b82f6' radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>

                {/* Detailed Table */}
                <div className='mt-6 overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='border-b'>
                                <th className='text-left py-2 px-2'>STT</th>
                                <th className='text-left py-2 px-2'>Dịch vụ</th>
                                <th className='text-right py-2 px-2'>Số lần</th>
                                <th className='text-right py-2 px-2'>Đơn giá</th>
                                <th className='text-right py-2 px-2'>Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topServices.map((service, index) => (
                                <tr key={service.serviceId} className='border-b hover:bg-muted/50'>
                                    <td className='py-2 px-2 text-muted-foreground'>{index + 1}</td>
                                    <td className='py-2 px-2 font-medium'>{service.serviceName}</td>
                                    <td className='text-right py-2 px-2'>
                                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                                            {service.usageCount}
                                        </span>
                                    </td>
                                    <td className='text-right py-2 px-2 text-muted-foreground'>
                                        {service.price.toLocaleString('vi-VN')} ₫
                                    </td>
                                    <td className='text-right py-2 px-2 font-semibold text-green-600'>
                                        {service.totalRevenue.toLocaleString('vi-VN')} ₫
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
