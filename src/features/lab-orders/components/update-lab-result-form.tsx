import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { updateLabResult, type UpdateLabResultPayload } from '../api/lab-orders'
import { ImageUpload } from './image-upload'
import type { LabResult } from '../types'

const updateLabResultSchema = z.object({
  resultDetails: z.string().min(1, 'Kết quả chi tiết là bắt buộc'),
  note: z.string().optional(),
  summary: z.string().optional(),
  explanation: z.string().optional(),
  isDone: z.boolean(),
})

type UpdateLabResultFormValues = z.infer<typeof updateLabResultSchema>

interface UpdateLabResultFormProps {
  labOrderId: number
  labResult: LabResult
  onSuccess?: () => void
}

export function UpdateLabResultForm({ labOrderId, labResult, onSuccess }: UpdateLabResultFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [images, setImages] = useState<File[]>([])

  const form = useForm<UpdateLabResultFormValues>({
    resolver: zodResolver(updateLabResultSchema),
    defaultValues: {
      resultDetails: labResult.resultDetails || '',
      note: labResult.note || '',
      summary: '',
      explanation: labResult.explanation || '',
      isDone: labResult.isDone || false,
    },
  })

  // Update form values when labResult changes
  useEffect(() => {
    form.reset({
      resultDetails: labResult.resultDetails || '',
      note: labResult.note || '',
      summary: '',
      explanation: labResult.explanation || '',
      isDone: labResult.isDone || false,
    })
  }, [labResult, form])

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

  const onSubmit = (values: UpdateLabResultFormValues) => {
    // TODO: Upload images to server first, then update lab result with image URLs
    // For now, we'll just submit the form data without images
    updateResultMutation.mutate({
      labOrderId,
      ...values,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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

        <FormField
          control={form.control}
          name='isDone'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>
                  Đánh dấu hoàn thành
                </FormLabel>
                <FormDescription>
                  Chọn để đánh dấu đã nhập đủ thông tin và sẵn sàng hoàn thành
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              form.reset()
              setImages([])
            }}
            disabled={updateResultMutation.isPending}
          >
            Hủy
          </Button>
          <Button type='submit' disabled={updateResultMutation.isPending}>
            {updateResultMutation.isPending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Cập nhật kết quả
          </Button>
        </div>
      </form>
    </Form>
  )
}
