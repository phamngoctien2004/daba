/**
 * Patient Demographics Charts
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    BarChart,
    Bar,
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
import type { PatientByGender, PatientByAgeGroup } from '../types'

interface PatientGenderChartProps {
    data: PatientByGender[]
    isLoading?: boolean
}

const GENDER_COLORS = {
    NAM: '#3b82f6',
    NU: '#ec4899',
}

export function PatientGenderChart({ data, isLoading }: PatientGenderChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Phân Bố Theo Giới Tính</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-80 w-full' />
                </CardContent>
            </Card>
        )
    }

    const chartData = data.map((item) => ({
        name: item.gender === 'NAM' ? 'Nam' : 'Nữ',
        value: item.count,
        percentage: item.percentage,
        fill: GENDER_COLORS[item.gender],
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Phân Bố Theo Giới Tính</CardTitle>
                <CardDescription>Thống kê bệnh nhân theo giới tính</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx='50%'
                            cy='50%'
                            labelLine={true}
                            outerRadius={100}
                            fill='#8884d8'
                            dataKey='value'
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value} bệnh nhân`, 'Số lượng']}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                <div className='mt-4 space-y-3'>
                    {chartData.map((item) => (
                        <div key={item.name} className='space-y-1'>
                            <div className='flex justify-between text-sm'>
                                <span className='font-medium'>{item.name}</span>
                                <span className='text-muted-foreground'>{item.percentage.toFixed(1)}%</span>
                            </div>
                            <div className='h-2 bg-muted rounded-full overflow-hidden'>
                                <div
                                    className='h-full'
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.fill
                                    }}
                                />
                            </div>
                            <div className='text-xs text-muted-foreground'>{item.value} bệnh nhân</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

interface PatientAgeChartProps {
    data: PatientByAgeGroup[]
    isLoading?: boolean
}

const AGE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PatientAgeChart({ data, isLoading }: PatientAgeChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Phân Bố Theo Độ Tuổi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-80 w-full' />
                </CardContent>
            </Card>
        )
    }

    const chartData = data.map((item, index) => ({
        name: item.ageGroup,
        'Số lượng': item.count,
        percentage: item.percentage,
        fill: AGE_COLORS[index % AGE_COLORS.length],
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Phân Bố Theo Độ Tuổi</CardTitle>
                <CardDescription>Thống kê bệnh nhân theo nhóm tuổi</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                        <XAxis
                            dataKey='name'
                            className='text-xs'
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className='text-xs'
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value} bệnh nhân`, 'Số lượng']}
                        />
                        <Legend />
                        <Bar dataKey='Số lượng'>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className='mt-4 space-y-3'>
                    {chartData.map((item) => (
                        <div key={item.name} className='space-y-1'>
                            <div className='flex justify-between text-sm'>
                                <span className='font-medium'>{item.name}</span>
                                <span className='text-muted-foreground'>{item.percentage.toFixed(1)}%</span>
                            </div>
                            <div className='h-2 bg-muted rounded-full overflow-hidden'>
                                <div
                                    className='h-full'
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.fill
                                    }}
                                />
                            </div>
                            <div className='text-xs text-muted-foreground'>{item['Số lượng']} bệnh nhân</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
