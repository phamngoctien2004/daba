import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  fetchMedicalRecordDetail,
  updateMedicalRecordStatus,
  type MedicalRecordDetail,
} from '../../api/medical-records'
import { fetchPatient, type Patient } from '@/features/patients/api/patients'
import { PatientInfo } from './patient-info'
import { ExaminationForm } from './examination-form'
import { LabOrders } from './lab-orders'
import { PrescriptionTab } from './prescription'

type ExaminationPageProps = {
  id: string
}

export function ExaminationPage({ id }: ExaminationPageProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('patient-info')

  // Fetch medical record detail
  const { data: medicalRecord, isLoading: isLoadingRecord } = useQuery({
    queryKey: ['medical-record-detail', id],
    queryFn: () => fetchMedicalRecordDetail(id),
  })

  // Fetch patient detail
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', medicalRecord?.patientId],
    queryFn: () =>
      medicalRecord?.patientId ? fetchPatient(medicalRecord.patientId) : Promise.resolve(null),
    enabled: !!medicalRecord?.patientId,
  })

  // Update status to DANG_KHAM when page loads if status is CHO_KHAM
  const updateStatusMutation = useMutation({
    mutationFn: updateMedicalRecordStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-record-detail', id] })
      toast({
        title: 'Thành công',
        description: 'Đã bắt đầu khám bệnh',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái',
      })
    },
  })

  // Auto update status when page loads
  useState(() => {
    if (medicalRecord?.status === 'CHO_KHAM') {
      updateStatusMutation.mutate({
        id: medicalRecord.id,
        status: 'DANG_KHAM',
      })
    }
  })

  if (isLoadingRecord || isLoadingPatient) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 text-lg font-medium'>Đang tải thông tin...</div>
        </div>
      </div>
    )
  }

  if (!medicalRecord) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 text-lg font-medium text-destructive'>
            Không tìm thấy phiếu khám
          </div>
          <Link to='/doctor-medical-records'>
            <Button variant='outline'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link to='/doctor-medical-records'>
            <Button variant='outline' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>Khám bệnh</h1>
            <p className='text-sm text-muted-foreground'>
              Mã phiếu: {medicalRecord.code} | Bệnh nhân: {medicalRecord.patientName}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className='p-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='patient-info'>Thông tin BN</TabsTrigger>
            <TabsTrigger value='examination'>Khám bệnh</TabsTrigger>
            <TabsTrigger value='lab-orders'>Chỉ định</TabsTrigger>
            <TabsTrigger value='prescription'>Đơn thuốc</TabsTrigger>
            <TabsTrigger value='history'>Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value='patient-info' className='mt-6'>
            <PatientInfo patient={patient || null} />
          </TabsContent>

          <TabsContent value='examination' className='mt-6'>
            <ExaminationForm medicalRecord={medicalRecord} />
          </TabsContent>

          <TabsContent value='lab-orders' className='mt-6'>
            <LabOrders medicalRecord={medicalRecord} />
          </TabsContent>

          <TabsContent value='prescription' className='mt-6'>
            <PrescriptionTab medicalRecord={medicalRecord} />
          </TabsContent>

          <TabsContent value='history' className='mt-6'>
            <div className='text-center py-8 text-muted-foreground'>
              Lịch sử khám bệnh (Sẽ làm sau)
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
