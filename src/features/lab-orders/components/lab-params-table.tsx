import { Badge } from '@/components/ui/badge'
import type { ParamResult } from '../types'

interface LabParamsTableProps {
    paramResults?: ParamResult[]
}

const statusConfig = {
    CAO: { label: 'Cao', variant: 'destructive' as const },
    THAP: { label: 'Thấp', variant: 'secondary' as const },
    TRUNG_BINH: { label: 'Bình thường', variant: 'outline' as const },
    CHUA_XAC_DINH: { label: 'Chưa xác định', variant: 'default' as const },
}

export function LabParamsTable({ paramResults }: LabParamsTableProps) {
    if (!paramResults || paramResults.length === 0) {
        return (
            <div className='rounded-lg border border-muted bg-muted/50 p-6 text-center'>
                <p className='text-sm text-muted-foreground'>
                    Chưa có thông số xét nghiệm
                </p>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
                {paramResults.map((param) => {
                    const statusInfo = statusConfig[param.rangeStatus] || statusConfig.CHUA_XAC_DINH
                    return (
                        <div key={param.id} className='rounded-lg border p-4 space-y-3'>
                            <div className='flex items-start justify-between gap-2'>
                                <div className='flex-1'>
                                    <h4 className='text-sm font-semibold'>{param.name}</h4>
                                    <p className='text-xs text-muted-foreground mt-1'>
                                        Đơn vị: {param.unit} | Bình thường: {param.range}
                                    </p>
                                </div>
                                <Badge variant={statusInfo.variant} className='text-xs shrink-0'>
                                    {statusInfo.label}
                                </Badge>
                            </div>

                            <div className='rounded-lg bg-muted/50 p-3'>
                                <p className='text-xs text-muted-foreground mb-1'>Giá trị</p>
                                <p className='text-base font-semibold'>
                                    {param.value ? (
                                        <span>{param.value} {param.unit}</span>
                                    ) : (
                                        <span className='text-muted-foreground italic text-sm'>Chưa nhập</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className='rounded-lg bg-muted/50 p-4'>
                <p className='text-xs text-muted-foreground'>
                    <span className='font-medium'>Lưu ý:</span> Kết quả xét nghiệm cần được bác sĩ phân tích và giải thích trong bối cảnh lâm sàng cụ thể của từng bệnh nhân.
                </p>
            </div>
        </div>
    )
}
