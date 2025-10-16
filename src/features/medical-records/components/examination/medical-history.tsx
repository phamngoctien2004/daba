import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchMedicalRecordsByPatient } from '../../api/medical-records'

type MedicalHistoryProps = {
  patientId: number
  currentRecordId: string
}

const statusLabels: Record<string, string> = {
  CHO_KHAM: 'Chờ khám',
  DANG_KHAM: 'Đang khám',
  CHO_XET_NGHIEM: 'Chờ xét nghiệm',
  HOAN_THANH: 'Hoàn thành',
  HUY: 'Hủy',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CHO_KHAM: 'secondary',
  DANG_KHAM: 'default',
  CHO_XET_NGHIEM: 'outline',
  HOAN_THANH: 'default',
  HUY: 'destructive',
}

export function MedicalHistory({ patientId, currentRecordId }: MedicalHistoryProps) {
  const navigate = useNavigate()

  const { data: historyRecords, isLoading } = useQuery({
    queryKey: ['medical-records-history', patientId],
    queryFn: () => fetchMedicalRecordsByPatient(patientId),
  })

  const handleViewDetail = (recordId: string) => {
    // Navigate to examination page with 'from' param to indicate viewing history
    navigate({
      to: '/doctor-medical-records/examine/$id',
      params: { id: recordId },
      search: { from: currentRecordId },
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground'>Đang tải lịch sử khám bệnh...</div>
      </div>
    )
  }

  // Filter out the current record being examined
  const filteredRecords = historyRecords?.filter((record) => record.id !== currentRecordId) || []

  if (filteredRecords.length === 0) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground'>Chưa có lịch sử khám bệnh</div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã phiếu</TableHead>
              <TableHead>Ngày khám</TableHead>
              <TableHead>Bác sĩ</TableHead>
              <TableHead>Triệu chứng</TableHead>
              <TableHead>Chẩn đoán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className='font-medium'>{record.code}</TableCell>
                <TableCell>
                  {record.date
                    ? format(new Date(record.date), 'dd/MM/yyyy HH:mm', { locale: vi })
                    : '-'}
                </TableCell>
                <TableCell>{record.doctorName || '-'}</TableCell>
                <TableCell className='max-w-xs truncate'>{record.symptoms || '-'}</TableCell>
                <TableCell className='max-w-xs truncate'>{record.diagnosis || '-'}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[record.status] || 'default'}>
                    {statusLabels[record.status] || record.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleViewDetail(record.id)}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
