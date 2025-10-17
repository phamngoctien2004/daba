import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createLabResult } from '../api/lab-orders'
import { LabResultDetailsForm } from './lab-result-details-form'

interface LabResultDetailsWrapperProps {
    labOrderId: number
    labResultId: number | null
    onSuccess?: () => void
}

/**
 * Wrapper component that handles creating a basic lab result first if it doesn't exist,
 * then shows the detailed parameters form
 */
export function LabResultDetailsWrapper({
    labOrderId,
    labResultId,
    onSuccess,
}: LabResultDetailsWrapperProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [createdLabResultId, setCreatedLabResultId] = useState<number | null>(labResultId)

    const createBasicResultMutation = useMutation({
        mutationFn: () =>
            createLabResult({
                labOrderId,
                resultDetails: 'Đang chờ nhập chi tiết',
                note: '',
                summary: '',
                explanation: '',
            }),
        onSuccess: (data) => {
            setCreatedLabResultId(data.id)
            queryClient.invalidateQueries({ queryKey: ['lab-orders', labOrderId] })
        },
        onError: (error: Error) => {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tạo kết quả xét nghiệm',
                variant: 'destructive',
            })
        },
    })

    // If we don't have a lab result yet, create one first
    if (!createdLabResultId) {
        if (createBasicResultMutation.isPending) {
            return (
                <div className='flex items-center justify-center py-8'>
                    <div className='text-center space-y-3'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary mx-auto' />
                        <p className='text-sm text-muted-foreground'>
                            Đang khởi tạo phiếu kết quả xét nghiệm...
                        </p>
                    </div>
                </div>
            )
        }

        if (createBasicResultMutation.isError) {
            return (
                <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
                    <p className='text-sm text-destructive mb-3'>
                        Không thể khởi tạo phiếu kết quả xét nghiệm
                    </p>
                    <button
                        onClick={() => createBasicResultMutation.mutate()}
                        className='text-sm font-medium text-primary hover:underline'
                    >
                        Thử lại
                    </button>
                </div>
            )
        }

        // Automatically create the basic result
        if (!createBasicResultMutation.isError && !createBasicResultMutation.isPending) {
            createBasicResultMutation.mutate()
            return (
                <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                </div>
            )
        }
    }

    // Once we have a lab result ID, show the details form
    return (
        <LabResultDetailsForm
            labOrderId={labOrderId}
            labResultId={createdLabResultId!}
            onSuccess={onSuccess}
        />
    )
}
