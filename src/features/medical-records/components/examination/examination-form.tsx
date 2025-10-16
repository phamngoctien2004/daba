import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  updateMedicalRecord,
  updateMedicalRecordStatus,
  type MedicalRecordDetail,
} from '../../api/medical-records'

type ExaminationFormProps = {
  medicalRecord: MedicalRecordDetail
}

export function ExaminationForm({ medicalRecord }: ExaminationFormProps) {
  const queryClient = useQueryClient()

  // Check if medical record is completed (read-only mode)
  const isCompleted = medicalRecord.status === 'HOAN_THANH'

  const [formData, setFormData] = useState({
    symptoms: medicalRecord.symptoms || '',
    clinicalExamination: medicalRecord.clinicalExamination || '',
    diagnosis: medicalRecord.diagnosis || '',
    treatmentPlan: medicalRecord.treatmentPlan || '',
    note: medicalRecord.note || '',
  })

  // Update form when medicalRecord changes
  useEffect(() => {
    setFormData({
      symptoms: medicalRecord.symptoms || '',
      clinicalExamination: medicalRecord.clinicalExamination || '',
      diagnosis: medicalRecord.diagnosis || '',
      treatmentPlan: medicalRecord.treatmentPlan || '',
      note: medicalRecord.note || '',
    })
  }, [medicalRecord])

  // Check if form is complete
  const isFormComplete =
    formData.clinicalExamination.trim() !== '' &&
    formData.diagnosis.trim() !== '' &&
    formData.treatmentPlan.trim() !== ''

  // Check if has lab orders
  const hasLabOrders =
    medicalRecord.invoiceDetailsResponse &&
    medicalRecord.invoiceDetailsResponse.length > 0

  // Check if all lab orders are completed
  const allLabOrdersCompleted =
    hasLabOrders &&
    medicalRecord.invoiceDetailsResponse?.every((invoice) => {
      if (invoice.multipleLab) {
        return invoice.multipleLab.every((lab) => lab.status === 'HOAN_THANH')
      }
      if (invoice.singleLab) {
        return invoice.singleLab.status === 'HOAN_THANH'
      }
      return true
    })

  // Update medical record mutation
  const updateMutation = useMutation({
    mutationFn: updateMedicalRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['medical-record-detail', medicalRecord.id],
      })
      toast.success('Cập nhật thông tin khám bệnh thành công')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật thông tin')
    },
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateMedicalRecordStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['medical-record-detail', medicalRecord.id],
      })
      const statusText =
        variables.status === 'CHO_XET_NGHIEM'
          ? 'Chuyển sang chờ xét nghiệm thành công'
          : 'Hoàn thành khám bệnh thành công'
      toast.success(statusText)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật trạng thái')
    },
  })

  const handleUpdate = () => {
    updateMutation.mutate({
      id: medicalRecord.id,
      ...formData,
    })
  }

  const handleProceedToLabOrders = () => {
    if (!hasLabOrders) {
      toast.error('Chưa có chỉ định nào')
      return
    }

    updateStatusMutation.mutate({
      id: medicalRecord.id,
      status: 'CHO_XET_NGHIEM',
    })
  }

  const handleComplete = () => {
    if (!isFormComplete) {
      toast.error('Vui lòng điền đầy đủ thông tin khám bệnh')
      return
    }

    if (hasLabOrders && !allLabOrdersCompleted) {
      toast.error('Còn chỉ định chưa hoàn thành')
      return
    }

    updateStatusMutation.mutate({
      id: medicalRecord.id,
      status: 'HOAN_THANH',
    })
  }

  const isUpdating = updateMutation.isPending || updateStatusMutation.isPending

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khám bệnh</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='symptoms'>Triệu chứng</Label>
            <Textarea
              id='symptoms'
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              placeholder='Nhập triệu chứng...'
              rows={3}
              disabled={isCompleted}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='clinicalExamination'>
              Khám lâm sàng <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='clinicalExamination'
              value={formData.clinicalExamination}
              onChange={(e) =>
                setFormData({ ...formData, clinicalExamination: e.target.value })
              }
              placeholder='Nhập kết quả khám lâm sàng...'
              rows={4}
              disabled={isCompleted}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='diagnosis'>
              Chẩn đoán <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='diagnosis'
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              placeholder='Nhập chẩn đoán...'
              rows={3}
              disabled={isCompleted}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='treatmentPlan'>
              Kế hoạch điều trị <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='treatmentPlan'
              value={formData.treatmentPlan}
              onChange={(e) =>
                setFormData({ ...formData, treatmentPlan: e.target.value })
              }
              placeholder='Nhập kế hoạch điều trị...'
              rows={4}
              disabled={isCompleted}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='note'>Ghi chú</Label>
            <Textarea
              id='note'
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder='Nhập ghi chú (nếu có)...'
              rows={3}
              disabled={isCompleted}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isCompleted && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className='gap-2'
              >
                <Save className='h-4 w-4' />
                Cập nhật
              </Button>

              <Button
                variant='secondary'
                onClick={handleProceedToLabOrders}
                disabled={isUpdating || !hasLabOrders}
                className='gap-2'
              >
                <Send className='h-4 w-4' />
                Tiến hành chỉ định
              </Button>

              <Button
                variant='default'
                onClick={handleComplete}
                disabled={isUpdating || !isFormComplete || (hasLabOrders && !allLabOrdersCompleted || false)}
                className='gap-2 bg-green-600 hover:bg-green-700'
              >
                <CheckCircle2 className='h-4 w-4' />
                Hoàn thành khám
              </Button>
            </div>

            {/* Helper text */}
            <div className='mt-4 space-y-2 text-sm text-muted-foreground'>
              {!isFormComplete && (
                <p>• Cần điền đầy đủ: Khám lâm sàng, Chẩn đoán, Kế hoạch điều trị</p>
              )}
              {!hasLabOrders && (
                <p>• Nút "Tiến hành chỉ định" chỉ khả dụng khi đã có chỉ định</p>
              )}
              {hasLabOrders && !allLabOrdersCompleted && (
                <p>• Nút "Hoàn thành" chỉ khả dụng khi tất cả chỉ định đã hoàn thành</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read-only indicator */}
      {isCompleted && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span>Phiếu khám này đã hoàn thành và không thể chỉnh sửa.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
