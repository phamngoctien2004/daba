import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { fetchLabResultDetails } from '../api/lab-orders'

interface LabResultDetailsViewProps {
    labOrderId: number
    labResultId: number
}

const statusConfig = {
    CAO: { label: 'Cao', variant: 'destructive' as const },
    THAP: { label: 'Thấp', variant: 'secondary' as const },
    TRUNG_BINH: { label: 'Bình thường', variant: 'outline' as const },
}

export function LabResultDetailsView({ labResultId }: LabResultDetailsViewProps) {
    const detailsQuery = useQuery({
        queryKey: ['lab-result-details', labResultId],
        queryFn: () => fetchLabResultDetails(labResultId),
    })

    if (detailsQuery.isLoading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
        )
    }

    if (detailsQuery.isError) {
        return (
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
                <p className='text-sm text-destructive'>
                    Không thể tải chi tiết kết quả xét nghiệm
                </p>
            </div>
        )
    }

    const details = detailsQuery.data ?? []

    if (details.length === 0) {
        return (
            <div className='rounded-lg border border-muted bg-muted/50 p-6 text-center'>
                <p className='text-sm text-muted-foreground'>
                    Chưa có chi tiết kết quả xét nghiệm
                </p>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            <div className='rounded-lg border'>
                <table className='w-full'>
                    <thead className='bg-muted/50'>
                        <tr>
                            <th className='px-4 py-3 text-left text-sm font-medium'>Thông số</th>
                            <th className='px-4 py-3 text-center text-sm font-medium'>Giá trị</th>
                            <th className='px-4 py-3 text-center text-sm font-medium'>Đơn vị</th>
                            <th className='px-4 py-3 text-center text-sm font-medium'>Khoảng bình thường</th>
                            <th className='px-4 py-3 text-center text-sm font-medium'>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y'>
                        {details.map((detail) => {
                            const statusInfo = statusConfig[detail.rangeStatus]
                            return (
                                <tr key={detail.id} className='hover:bg-muted/25'>
                                    <td className='px-4 py-3 text-sm font-medium'>{detail.name}</td>
                                    <td className='px-4 py-3 text-center text-sm'>{detail.value}</td>
                                    <td className='px-4 py-3 text-center text-sm text-muted-foreground'>
                                        {detail.unit}
                                    </td>
                                    <td className='px-4 py-3 text-center text-sm text-muted-foreground'>
                                        {detail.range} {detail.unit}
                                    </td>
                                    <td className='px-4 py-3 text-center'>
                                        <Badge variant={statusInfo.variant} className='text-xs'>
                                            {statusInfo.label}
                                        </Badge>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className='rounded-lg bg-muted/50 p-4'>
                <p className='text-xs text-muted-foreground'>
                    <span className='font-medium'>Lưu ý:</span> Kết quả xét nghiệm cần được bác sĩ phân tích và giải thích trong bối cảnh lâm sàng cụ thể của từng bệnh nhân.
                </p>
            </div>
        </div>
    )
}
