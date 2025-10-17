import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { createLabResultDetails, updateLabOrderStatus, createLabResult, updateLabResult } from '../api/lab-orders'
import { LabResultImageUploadDialog } from './lab-result-image-upload-dialog'
import type { ParamResult, LabResult } from '../types'

interface LabParamsFormProps {
    labOrderId: number
    labResultId: number
    paramResults: ParamResult[]
    labResult?: LabResult | null
    onSuccess?: () => void
}

const statusConfig = {
    CAO: { label: 'Cao', variant: 'destructive' as const },
    THAP: { label: 'Thấp', variant: 'secondary' as const },
    TRUNG_BINH: { label: 'Bình thường', variant: 'outline' as const },
    CHUA_XAC_DINH: { label: 'Chưa xác định', variant: 'default' as const },
}

export function LabParamsForm({ labOrderId, labResultId, paramResults, labResult, onSuccess }: LabParamsFormProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [images, setImages] = useState<File[]>([])
    const [showCompleteDialog, setShowCompleteDialog] = useState(false)

    // Create dynamic schema based on paramResults + lab result fields
    const schemaFields: Record<string, z.ZodString | z.ZodOptional<z.ZodString>> = {
        resultDetails: z.string().min(1, 'Kết quả chi tiết là bắt buộc'),
        note: z.string().optional(),
        explanation: z.string().optional(),
    }
    paramResults.forEach((param) => {
        schemaFields[`param_${param.id}`] = z.string().min(1, 'Vui lòng nhập giá trị')
    })
    const formSchema = z.object(schemaFields)

    type FormValues = z.infer<typeof formSchema>

    // Initialize form with default values
    const defaultValues: Record<string, string> = {
        resultDetails: labResult?.resultDetails || '',
        note: labResult?.note || '',
        explanation: labResult?.explanation || '',
    }
    paramResults.forEach((param) => {
        defaultValues[`param_${param.id}`] = param.value || ''
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const saveParamsMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            // Step 1: Save/update lab result (resultDetails, note, explanation)
            if (labResult) {
                await updateLabResult({
                    labOrderId,
                    resultDetails: values.resultDetails || '',
                    note: values.note,
                    explanation: values.explanation,
                    isDone: false,
                })
            } else {
                await createLabResult({
                    labOrderId,
                    resultDetails: values.resultDetails || '',
                    note: values.note,
                    explanation: values.explanation,
                })
            }

            // Step 2: Save param details
            const paramDetails = paramResults.map((param) => ({
                paramId: param.id,
                value: values[`param_${param.id}`] || '',
            }))

            await createLabResultDetails({
                labResultId,
                paramDetails,
            })
        },
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Đã lưu kết quả xét nghiệm',
            })
            queryClient.invalidateQueries({ queryKey: ['lab-orders', labOrderId] })
            onSuccess?.()
        },
        onError: (error: Error) => {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể lưu kết quả. Vui lòng thử lại.',
                variant: 'destructive',
            })
        },
    })

    const completeParamsMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            // Step 1: Save/update lab result
            if (labResult) {
                await updateLabResult({
                    labOrderId,
                    resultDetails: values.resultDetails || '',
                    note: values.note,
                    explanation: values.explanation,
                    isDone: true,
                })
            } else {
                await createLabResult({
                    labOrderId,
                    resultDetails: values.resultDetails || '',
                    note: values.note,
                    explanation: values.explanation,
                })
            }

            // Step 2: Save param details
            const paramDetails = paramResults.map((param) => ({
                paramId: param.id,
                value: values[`param_${param.id}`] || '',
            }))

            await createLabResultDetails({
                labResultId,
                paramDetails,
            })

            // Step 3: Update status to HOAN_THANH
            await updateLabOrderStatus({
                id: labOrderId,
                status: 'HOAN_THANH',
            })
        },
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Đã hoàn thành phiếu xét nghiệm',
            })
            queryClient.invalidateQueries({ queryKey: ['lab-orders', labOrderId] })
            onSuccess?.()
        },
        onError: (error: Error) => {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể hoàn thành. Vui lòng thử lại.',
                variant: 'destructive',
            })
        },
    })

    const onSave = (values: FormValues) => {
        saveParamsMutation.mutate(values)
    }

    const handleCompleteClick = () => {
        // Validate form first
        form.handleSubmit(() => {
            // If validation passes, show confirm dialog
            setShowCompleteDialog(true)
        })()
    }

    const onConfirmComplete = () => {
        const values = form.getValues()
        completeParamsMutation.mutate(values)
        setShowCompleteDialog(false)
    }

    const isPending = saveParamsMutation.isPending || completeParamsMutation.isPending

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className='space-y-6'>
                {/* Lab Result Fields */}
                <div className='space-y-4'>
                    <div>
                        <h3 className='text-lg font-semibold mb-4'>Kết quả xét nghiệm</h3>

                        <div className='space-y-4'>
                            <FormField
                                control={form.control}
                                name='resultDetails'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kết quả chi tiết *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Nhập kết quả xét nghiệm chi tiết...'
                                                className='min-h-[100px]'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Mô tả chi tiết kết quả xét nghiệm
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='note'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ghi chú</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Nhập ghi chú (nếu có)...'
                                                className='min-h-[80px]'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Các ghi chú bổ sung về kết quả
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='explanation'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giải thích</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Nhập giải thích cho bệnh nhân...'
                                                className='min-h-[80px]'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Giải thích kết quả dễ hiểu cho bệnh nhân
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>
                                <FormLabel>Ảnh kết quả xét nghiệm</FormLabel>
                                <div className='mt-2'>
                                    <LabResultImageUploadDialog
                                        currentImages={images}
                                        onImagesChange={setImages}
                                    />
                                </div>
                                <p className='text-sm text-muted-foreground mt-2'>
                                    Tải lên ảnh kết quả xét nghiệm (tối đa 10 ảnh)
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Lab Parameters Grid */}
                    <div>
                        <h3 className='text-lg font-semibold mb-4'>Chỉ số xét nghiệm</h3>
                    </div>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                    {paramResults.map((param) => {
                        const statusInfo = statusConfig[param.rangeStatus] || statusConfig.CHUA_XAC_DINH
                        return (
                            <div key={param.id} className='rounded-lg border p-4 space-y-3'>
                                <div className='flex items-start justify-between gap-2'>
                                    <div className='flex-1'>
                                        <h4 className='text-sm font-semibold'>{param.name}
                                            <span className="text-xs text-muted-foreground"> Bình thường: {param.range}</span>
                                        </h4>
                                        {/* <p className='text-xs text-muted-foreground mt-1'>
                                            Đơn vị: {param.unit} | Bình thường: {param.range}
                                        </p> */}
                                    </div>
                                    <Badge variant={statusInfo.variant} className='text-xs shrink-0'>
                                        {statusInfo.label}
                                    </Badge>
                                </div>

                                <FormField
                                    control={form.control}
                                    name={`param_${param.id}` as any}
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* <FormLabel className='text-xs'>Giá trị *</FormLabel> */}
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type='text'
                                                    placeholder={`Nhập giá trị (${param.unit})`}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs' />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )
                    })}
                </div>

                <div className='rounded-lg bg-muted/50 p-4'>
                    <p className='text-xs text-muted-foreground'>
                        <span className='font-medium'>Lưu ý:</span> Vui lòng nhập đầy đủ giá trị cho tất cả các thông số xét nghiệm.
                    </p>
                </div>

                <div className='flex items-center justify-end gap-3'>
                    <Button
                        type='submit'
                        variant='outline'
                        disabled={isPending}
                    >
                        {saveParamsMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Lưu kết quả
                    </Button>
                    <Button
                        type='button'
                        onClick={handleCompleteClick}
                        disabled={isPending}
                    >
                        {completeParamsMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        <CheckCircle2 className='mr-2 h-4 w-4' />
                        Hoàn thành xét nghiệm
                    </Button>
                </div>
            </form>

            {/* Confirm Complete Dialog */}
            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center gap-2'>
                            <AlertTriangle className='h-5 w-5 text-amber-500' />
                            Xác nhận hoàn thành xét nghiệm
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hoàn thành phiếu xét nghiệm này?
                            <br />
                            <br />
                            Sau khi hoàn thành, trạng thái sẽ được cập nhật thành <strong>HOÀN THÀNH</strong> và không thể chỉnh sửa lại.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmComplete}>
                            Xác nhận hoàn thành
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Form>
    )
}
