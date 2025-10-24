import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
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
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { fetchLabOrderParams, createLabResultDetails } from '../api/lab-orders'
import type { LabResultDetailParam } from '../types'

interface LabResultDetailsFormProps {
    labOrderId: number
    labResultId: number
    onSuccess?: () => void
}

export function LabResultDetailsForm({
    labOrderId,
    labResultId,
    onSuccess,
}: LabResultDetailsFormProps) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch lab order params
    const paramsQuery = useQuery({
        queryKey: ['lab-order-params', labOrderId],
        queryFn: () => fetchLabOrderParams(labOrderId),
    })

    const params = paramsQuery.data ?? []

    // Create dynamic schema based on params
    const createSchema = () => {
        const schemaFields: Record<string, z.ZodString> = {}

        params.forEach((param) => {
            schemaFields[`param_${param.id}`] = z
                .string()
                .min(1, `Giá trị ${param.name} là bắt buộc`)
                .regex(/^-?\d+\.?\d*$/, `Giá trị ${param.name} phải là số`)
        })

        return z.object(schemaFields)
    }

    const formSchema = createSchema()
    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    })

    // Reset form when params change
    useEffect(() => {
        if (params.length > 0) {
            const defaultValues: Record<string, string> = {}
            params.forEach((param) => {
                defaultValues[`param_${param.id}`] = ''
            })
            form.reset(defaultValues)
        }
    }, [params, form])

    const createMutation = useMutation({
        mutationFn: createLabResultDetails,
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: 'Đã tạo chi tiết kết quả xét nghiệm',
            })
            queryClient.invalidateQueries({ queryKey: ['lab-orders', labOrderId] })
            onSuccess?.()
        },
        onError: (error) => {
            console.error('Error creating lab result details:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo chi tiết kết quả xét nghiệm',
                variant: 'destructive',
            })
        },
        onSettled: () => {
            setIsSubmitting(false)
        },
    })

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true)

        // Transform form values to API payload
        const paramDetails: LabResultDetailParam[] = params.map((param) => ({
            paramId: param.id,
            value: values[`param_${param.id}`],
        }))

        createMutation.mutate({
            labResultId,
            paramDetails,
        })
    }

    if (paramsQuery.isLoading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
        )
    }

    if (paramsQuery.isError) {
        return (
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
                <p className='text-sm text-destructive'>
                    Không thể tải danh sách thông số xét nghiệm
                </p>
            </div>
        )
    }

    if (params.length === 0) {
        return (
            <div className='rounded-lg border border-muted bg-muted/50 p-4'>
                <p className='text-sm text-muted-foreground'>
                    Không có thông số xét nghiệm nào để nhập
                </p>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='space-y-4'>
                    {params.map((param) => (
                        <FormField
                            key={param.id}
                            control={form.control}
                            name={`param_${param.id}` as keyof FormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{param.name}</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='text'
                                                placeholder={`Nhập giá trị...`}
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                            <span className='min-w-[60px] text-sm text-muted-foreground'>
                                                {param.unit}
                                            </span>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Khoảng bình thường: {param.range} {param.unit}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <div className='flex justify-end gap-2 pt-4'>
                    <Button type='submit' disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Lưu kết quả
                    </Button>
                </div>
            </form>
        </Form>
    )
}
