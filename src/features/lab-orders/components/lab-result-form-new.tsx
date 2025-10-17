import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, CheckCircle2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  createLabResult,
  updateLabResult,
  updateLabOrderStatus,
  type CreateLabResultPayload,
  type UpdateLabResultPayload
} from '../api/lab-orders'
import { ImageUpload } from './image-upload'
import type { LabResult } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LabResultDetailsWrapper } from './lab-result-details-wrapper'

const labResultSchema = z.object({
  resultDetails: z.string().min(1, 'Kết quả chi tiết là bắt buộc'),
  note: z.string().optional(),
  summary: z.string().optional(),
  explanation: z.string().optional(),
})

type LabResultFormValues = z.infer<typeof labResultSchema>

interface LabResultFormNewProps {
  labOrderId: number
  labResult?: LabResult | null
  onSuccess?: () => void
}

export function LabResultFormNew({ labOrderId, labResult, onSuccess }: LabResultFormNewProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [images, setImages] = useState<File[]>([])
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const isEditing = !!labResult

  const form = useForm<LabResultFormValues>({
    resolver: zodResolver(labResultSchema),
    defaultValues: {
      resultDetails: labResult?.resultDetails || '',
      note: labResult?.note || '',
      summary: '',
      explanation: labResult?.explanation || '',
    },
  })

  // Update form values when labResult changes
  useEffect(() => {
    if (labResult) {
      form.reset({
        resultDetails: labResult.resultDetails || '',
        note: labResult.note || '',
        summary: '',
        explanation: labResult.explanation || '',
      })
    }
  }, [labResult, form])

  const createResultMutation = useMutation({
    mutationFn: (payload: CreateLabResultPayload) => createLabResult(payload),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã lưu kết quả xét nghiệm',
      })
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] })
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

  const updateResultMutation = useMutation({
    mutationFn: (payload: UpdateLabResultPayload) => updateLabResult(payload),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật kết quả xét nghiệm',
      })
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật kết quả. Vui lòng thử lại.',
        variant: 'destructive',
      })
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (values: LabResultFormValues) => {
      // First save/update the result
      if (isEditing) {
        await updateLabResult({
          labOrderId,
          ...values,
          isDone: true,
        })
      } else {
        await createLabResult({
          labOrderId,
          ...values,
        })
      }
      // Then update status to HOAN_THANH
      await updateLabOrderStatus({
        id: labOrderId,
        status: 'HOAN_THANH'
      })
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã hoàn thành phiếu xét nghiệm',
      })
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] })
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

  const onSave = (values: LabResultFormValues) => {
    // TODO: Upload images to server first, then save lab result with image URLs
    // For now, we'll just submit the form data without images
    if (isEditing) {
      updateResultMutation.mutate({
        labOrderId,
        ...values,
        isDone: false,
      })
    } else {
      createResultMutation.mutate({
        labOrderId,
        ...values,
      })
    }
  }

  const onComplete = () => {
    const values = form.getValues()
    completeMutation.mutate(values)
  }

  const isPending = createResultMutation.isPending || updateResultMutation.isPending || completeMutation.isPending

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>
              {isEditing ? 'Cập nhật kết quả xét nghiệm' : 'Nhập kết quả xét nghiệm'}
            </h3>
          </div>

          <FormField
            control={form.control}
            name='resultDetails'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kết quả chi tiết *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Nhập kết quả xét nghiệm chi tiết...'
                    className='min-h-[120px]'
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
            name='summary'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tổng quan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Nhập tổng quan kết quả...'
                    className='min-h-[80px]'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tóm tắt tổng quan về kết quả xét nghiệm
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

          <div className='space-y-2'>
            <FormLabel>Ảnh kết quả xét nghiệm</FormLabel>
            <ImageUpload value={images} onChange={setImages} maxFiles={10} />
            <p className='text-sm text-muted-foreground'>
              Tải lên ảnh kết quả xét nghiệm (tối đa 10 ảnh)
            </p>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='submit'
              variant='outline'
              disabled={isPending}
            >
              {(createResultMutation.isPending || updateResultMutation.isPending) && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Lưu kết quả
            </Button>
            <Button
              type='button'
              onClick={onComplete}
              disabled={isPending}
            >
              {completeMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              <CheckCircle2 className='mr-2 h-4 w-4' />
              Hoàn thành
            </Button>
          </div>
        </form>
      </Form>

      {/* Lab Result Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Nhập thông số xét nghiệm</DialogTitle>
            <DialogDescription>
              Nhập các thông số xét nghiệm chi tiết
            </DialogDescription>
          </DialogHeader>
          {labResult && (
            <LabResultDetailsWrapper
              labOrderId={labOrderId}
              labResultId={labResult.id}
              onSuccess={() => {
                setIsDetailsDialogOpen(false)
                onSuccess?.()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
