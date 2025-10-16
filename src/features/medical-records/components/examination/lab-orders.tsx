import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { MedicalRecordDetail } from '../../api/medical-records'
import {
  createLabOrder,
  deleteLabOrder,
  fetchServices,
  fetchLabOrderDetail,
  type LabOrder,
} from '../../api/lab-orders'

type LabOrdersProps = {
  medicalRecord: MedicalRecordDetail
  readOnly?: boolean
}

const statusConfig = {
  CHO_THUC_HIEN: { label: 'Chờ thực hiện', variant: 'secondary' as const },
  DANG_THUC_HIEN: { label: 'Đang thực hiện', variant: 'default' as const },
  HOAN_THANH: { label: 'Hoàn thành', variant: 'outline' as const },
  HUY: { label: 'Hủy', variant: 'destructive' as const },
}

export function LabOrders({ medicalRecord, readOnly = false }: LabOrdersProps) {
  const queryClient = useQueryClient()

  // Check if medical record is completed or in read-only mode
  const isCompleted = medicalRecord.status === 'HOAN_THANH'
  const isReadOnly = isCompleted || readOnly

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedLabOrderId, setSelectedLabOrderId] = useState<number | null>(null)

  // Form state for creating lab order
  const [createForm, setCreateForm] = useState({
    healthPlanId: '',
    performingDoctor: '',
    diagnosis: '',
  })

  // Fetch lab order detail when viewing
  const { data: labOrderDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['lab-order-detail', selectedLabOrderId],
    queryFn: () => fetchLabOrderDetail(selectedLabOrderId!),
    enabled: !!selectedLabOrderId && isViewDialogOpen,
  })

  // Extract lab orders from medical record (remove duplicates by id)
  const labOrdersMap = new Map<number, LabOrder>()
  medicalRecord.invoiceDetailsResponse?.forEach((invoice) => {
    if (invoice.multipleLab) {
      invoice.multipleLab.forEach((lab) => {
        labOrdersMap.set(lab.id, lab)
      })
    }
    if (invoice.singleLab) {
      labOrdersMap.set(invoice.singleLab.id, invoice.singleLab)
    }
  })
  const labOrders = Array.from(labOrdersMap.values())

  // Fetch services for creating lab order
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchServices(),
    enabled: isCreateDialogOpen,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createLabOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['medical-record-detail', medicalRecord.id],
      })
      toast.success('Thêm chỉ định thành công')
      setIsCreateDialogOpen(false)
      setCreateForm({ healthPlanId: '', performingDoctor: '', diagnosis: '' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể thêm chỉ định')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLabOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['medical-record-detail', medicalRecord.id],
      })
      toast.success('Xóa chỉ định thành công')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa chỉ định')
    },
  })

  const handleCreate = () => {
    if (!createForm.healthPlanId) {
      toast.error('Vui lòng chọn dịch vụ')
      return
    }

    createMutation.mutate({
      recordId: Number(medicalRecord.id),
      healthPlanId: Number(createForm.healthPlanId),
      performingDoctor: createForm.performingDoctor ? Number(createForm.performingDoctor) : null,
      diagnosis: createForm.diagnosis || null,
    })
  }

  const handleDelete = (labOrderId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa chỉ định này?')) {
      deleteMutation.mutate(labOrderId)
    }
  }

  const handleView = (labOrderId: number) => {
    setSelectedLabOrderId(labOrderId)
    setIsViewDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
    } catch {
      return dateString
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Danh sách chỉ định</CardTitle>
            {!isReadOnly && (
              <Button onClick={() => setIsCreateDialogOpen(true)} size='sm' className='gap-2'>
                <Plus className='h-4 w-4' />
                Thêm chỉ định
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {labOrders.length === 0 ? (
            <div className='py-8 text-center text-muted-foreground'>
              Chưa có chỉ định nào
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã chỉ định</TableHead>
                    <TableHead>Tên chỉ định</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Bác sĩ thực hiện</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labOrders.map((labOrder) => {
                    const config = statusConfig[labOrder.status]
                    return (
                      <TableRow key={labOrder.id}>
                        <TableCell className='font-medium'>{labOrder.code}</TableCell>
                        <TableCell>{labOrder.name}</TableCell>
                        <TableCell>{labOrder.room}</TableCell>
                        <TableCell>{labOrder.doctorPerforming || '-'}</TableCell>
                        <TableCell>{formatDate(labOrder.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleView(labOrder.id)}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            {!isReadOnly && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDelete(labOrder.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm chỉ định xét nghiệm</DialogTitle>
            <DialogDescription>
              Chọn dịch vụ xét nghiệm và thông tin bác sĩ thực hiện
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='service'>
                Dịch vụ xét nghiệm <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={createForm.healthPlanId}
                onValueChange={(value) =>
                  setCreateForm({ ...createForm, healthPlanId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn dịch vụ xét nghiệm' />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.name} - {service.roomName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='performingDoctor'>Bác sĩ thực hiện (ID)</Label>
              <Input
                id='performingDoctor'
                type='number'
                value={createForm.performingDoctor}
                onChange={(e) =>
                  setCreateForm({ ...createForm, performingDoctor: e.target.value })
                }
                placeholder='Nhập ID bác sĩ thực hiện (nếu có)...'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='diagnosis'>Chẩn đoán</Label>
              <Textarea
                id='diagnosis'
                value={createForm.diagnosis}
                onChange={(e) =>
                  setCreateForm({ ...createForm, diagnosis: e.target.value })
                }
                placeholder='Nhập chẩn đoán (nếu có)...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết chỉ định</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className='py-8 text-center text-muted-foreground'>Đang tải...</div>
          ) : labOrderDetail ? (
            <div className='space-y-4 py-4'>
              <div className='grid gap-4'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Mã chỉ định
                  </label>
                  <p className='text-sm'>{labOrderDetail.code}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Tên dịch vụ
                  </label>
                  <p className='text-sm'>{labOrderDetail.healthPlanName}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>Phòng</label>
                  <p className='text-sm'>{labOrderDetail.room}</p>
                </div>


                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Bác sĩ thực hiện
                  </label>
                  <p className='text-sm'>{labOrderDetail.doctorPerformed || '-'}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Ngày chỉ định
                  </label>
                  <p className='text-sm'>{formatDate(labOrderDetail.orderDate)}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Ngày dự kiến có kết quả
                  </label>
                  <p className='text-sm'>{formatDate(labOrderDetail.expectedResultDate)}</p>
                </div>
                {labOrderDetail.diagnosis && (
                  <div className='space-y-1'>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Chẩn đoán
                    </label>
                    <p className='text-sm'>{labOrderDetail.diagnosis}</p>
                  </div>
                )}
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Trạng thái
                  </label>
                  <div>
                    <Badge variant={statusConfig[labOrderDetail.status]?.variant || 'outline'}>
                      {statusConfig[labOrderDetail.status]?.label || labOrderDetail.status}
                    </Badge>
                  </div>
                </div>
                {labOrderDetail.statusPayment && (
                  <div className='space-y-1'>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Trạng thái thanh toán
                    </label>
                    <p className='text-sm'>{labOrderDetail.statusPayment}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='py-8 text-center text-muted-foreground'>
              Không tìm thấy thông tin chỉ định
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
