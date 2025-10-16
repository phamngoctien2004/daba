import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { MedicalRecordDetail } from '../../api/medical-records'
import {
  fetchPrescriptionsByMedicalRecord,
  createPrescription,
  updatePrescription,
  addPrescriptionDetail,
  updatePrescriptionDetail,
  deletePrescriptionDetail,
  fetchMedicines,
  type Prescription,
  type PrescriptionDetail,
} from '../../api/prescriptions'

type PrescriptionProps = {
  medicalRecord: MedicalRecordDetail
  readOnly?: boolean
}

export function PrescriptionTab({ medicalRecord, readOnly = false }: PrescriptionProps) {
  const queryClient = useQueryClient()

  // Check if medical record is completed or in read-only mode
  const isCompleted = medicalRecord.status === 'HOAN_THANH'
  const isReadOnly = isCompleted || readOnly

  const [hasPrescription, setHasPrescription] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null)
  const [isAddDetailDialogOpen, setIsAddDetailDialogOpen] = useState(false)
  const [isEditDetailDialogOpen, setIsEditDetailDialogOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<PrescriptionDetail | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Debounce search keyword to avoid too many API calls
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500)

  // Form state for general instructions
  const [generalNote, setGeneralNote] = useState('')

  // Form state for adding medicine detail
  const [addForm, setAddForm] = useState<{
    medicineId: string
    usageInstructions: string
    quantity: number | ''
  }>({
    medicineId: '',
    usageInstructions: '',
    quantity: 1,
  })

  // Form state for editing medicine detail
  const [editForm, setEditForm] = useState<{
    medicineId: string
    usageInstructions: string
    quantity: number | ''
  }>({
    medicineId: '',
    usageInstructions: '',
    quantity: 1,
  })

  // Fetch prescriptions
  const { data: prescriptions = [], isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ['prescriptions', medicalRecord.id],
    queryFn: () => fetchPrescriptionsByMedicalRecord(medicalRecord.id),
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false,
  })

  // Fetch medicines with debounced search
  const { data: medicines = [], isLoading: isLoadingMedicines } = useQuery({
    queryKey: ['medicines', debouncedSearchKeyword],
    queryFn: () => fetchMedicines({ keyword: debouncedSearchKeyword, limit: 50 }),
    enabled: isAddDetailDialogOpen || isEditDetailDialogOpen, // Only fetch when dialog is open
  })

  // Check if prescription exists
  useEffect(() => {
    if (prescriptions.length > 0) {
      setHasPrescription(true)
      setCurrentPrescription(prescriptions[0])
      // Use generalInstructions from new API structure
      setGeneralNote(prescriptions[0].generalInstructions || prescriptions[0].note || '')
    } else {
      setHasPrescription(false)
      setCurrentPrescription(null)
    }
  }, [prescriptions])

  // Create prescription mutation
  const createMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: async () => {
      // Small delay to ensure backend has saved the data
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Refetch prescriptions after creation
      await queryClient.invalidateQueries({
        queryKey: ['prescriptions', medicalRecord.id],
      })
      await queryClient.refetchQueries({
        queryKey: ['prescriptions', medicalRecord.id],
      })

      toast.success('Tạo đơn thuốc thành công')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo đơn thuốc')
    },
  })

  // Update prescription mutation
  const updatePrescriptionMutation = useMutation({
    mutationFn: updatePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prescriptions', medicalRecord.id],
      })
      toast.success('Cập nhật hướng dẫn chung thành công')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật hướng dẫn')
    },
  })

  // Add detail mutation
  const addDetailMutation = useMutation({
    mutationFn: addPrescriptionDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prescriptions', medicalRecord.id],
      })
      toast.success('Thêm thuốc thành công')
      setIsAddDetailDialogOpen(false)
      setAddForm({ medicineId: '', usageInstructions: '', quantity: 1 })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể thêm thuốc')
    },
  })

  // Update detail mutation
  const updateDetailMutation = useMutation({
    mutationFn: updatePrescriptionDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prescriptions', medicalRecord.id],
      })
      toast.success('Cập nhật thuốc thành công')
      setIsEditDetailDialogOpen(false)
      setSelectedDetail(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật thuốc')
    },
  })

  // Delete detail mutation
  const deleteDetailMutation = useMutation({
    mutationFn: deletePrescriptionDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prescriptions', medicalRecord.id],
      })
      toast.success('Xóa thuốc thành công')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa thuốc')
    },
  })

  const handleCreatePrescription = () => {
    createMutation.mutate({
      medicalRecordId: Number(medicalRecord.id),
      note: generalNote || null,
    })
  }

  const handleUpdateGeneralNote = () => {
    if (!currentPrescription) return
    updatePrescriptionMutation.mutate({
      id: currentPrescription.id,
      note: generalNote,
    })
  }

  const handleAddDetail = () => {
    if (!currentPrescription) return
    if (!addForm.medicineId) {
      toast.error('Vui lòng chọn thuốc')
      return
    }
    if (!addForm.quantity || addForm.quantity < 1) {
      toast.error('Vui lòng nhập số lượng hợp lệ (tối thiểu 1)')
      return
    }

    addDetailMutation.mutate({
      prescriptionId: currentPrescription.id,
      medicineId: Number(addForm.medicineId),
      usageInstructions: addForm.usageInstructions,
      quantity: Number(addForm.quantity),
    })
  }

  const handleUpdateDetail = () => {
    if (!selectedDetail) return
    if (!editForm.quantity || editForm.quantity < 1) {
      toast.error('Vui lòng nhập số lượng hợp lệ (tối thiểu 1)')
      return
    }

    updateDetailMutation.mutate({
      id: selectedDetail.id,
      medicineId: Number(editForm.medicineId),
      usageInstructions: editForm.usageInstructions,
      quantity: Number(editForm.quantity),
    })
  }

  const handleDeleteDetail = (detailId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
      deleteDetailMutation.mutate(detailId)
    }
  }

  // Reset search when opening/closing dialogs
  const handleOpenAddDialog = () => {
    setSearchKeyword('')
    setIsAddDetailDialogOpen(true)
  }

  const handleCloseAddDialog = () => {
    setSearchKeyword('')
    setIsAddDetailDialogOpen(false)
  }

  const handleOpenEditDialog = (detail: PrescriptionDetail) => {
    setSearchKeyword('')
    setSelectedDetail(detail)
    setEditForm({
      medicineId: String(detail.medicineResponse.id),
      usageInstructions: detail.usageInstructions,
      quantity: detail.quantity,
    })
    setIsEditDetailDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setSearchKeyword('')
    setIsEditDetailDialogOpen(false)
    setSelectedDetail(null)
  }

  // Show loading state while fetching prescriptions
  if (isLoadingPrescriptions) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center gap-4 py-12'>
            <FileText className='h-16 w-16 text-muted-foreground animate-pulse' />
            <div className='text-center'>
              <h3 className='text-lg font-semibold'>Đang tải...</h3>
              <p className='text-sm text-muted-foreground'>Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no prescription, show create button
  if (!hasPrescription) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center gap-4 py-12'>
            <FileText className='h-16 w-16 text-muted-foreground' />
            <div className='text-center'>
              <h3 className='text-lg font-semibold'>
                {createMutation.isPending ? 'Đang tạo đơn thuốc...' : 'Chưa có đơn thuốc'}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {createMutation.isPending
                  ? 'Vui lòng đợi trong giây lát'
                  : isReadOnly
                    ? 'Phiếu khám này không có đơn thuốc'
                    : 'Tạo đơn thuốc cho bệnh nhân'}
              </p>
            </div>
            {!isReadOnly && (
              <Button
                onClick={handleCreatePrescription}
                disabled={createMutation.isPending}
                className='gap-2'
              >
                <Plus className='h-4 w-4' />
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo đơn thuốc'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* General Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn chung</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Textarea
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder='Nhập hướng dẫn chung cho bệnh nhân...'
              rows={4}
              disabled={isReadOnly}
            />
          </div>
          {!isReadOnly && (
            <Button
              onClick={handleUpdateGeneralNote}
              disabled={updatePrescriptionMutation.isPending}
              size='sm'
            >
              Cập nhật hướng dẫn
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Medicine Details */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Danh sách thuốc</CardTitle>
            {!isReadOnly && (
              <Button
                onClick={handleOpenAddDialog}
                size='sm'
                className='gap-2'
              >
                <Plus className='h-4 w-4' />
                Thêm thuốc
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            // Support both old and new API structure
            const details = currentPrescription?.detailResponses || currentPrescription?.details || []
            return !details || details.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>
                Chưa có thuốc nào trong đơn
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thuốc</TableHead>
                      <TableHead>Nồng độ</TableHead>
                      <TableHead>Dạng bào chế</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Cách dùng</TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className='font-medium'>
                          {detail.medicineResponse.name || '-'}
                        </TableCell>
                        <TableCell>{detail.medicineResponse.concentration || '-'}</TableCell>
                        <TableCell>{detail.medicineResponse.dosageForm || '-'}</TableCell>
                        <TableCell>{detail.medicineResponse.unit || '-'}</TableCell>
                        <TableCell>{detail.quantity}</TableCell>
                        <TableCell className='max-w-xs'>
                          {detail.usageInstructions}
                        </TableCell>
                        <TableCell className='text-right'>
                          {!isReadOnly && (
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleOpenEditDialog(detail)}
                              >
                                <Pencil className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDeleteDetail(detail.id)}
                                disabled={deleteDetailMutation.isPending}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Add Medicine Dialog */}
      <Dialog open={isAddDetailDialogOpen} onOpenChange={(open) => !open && handleCloseAddDialog()}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Thêm thuốc</DialogTitle>
            <DialogDescription>Tìm kiếm và chọn thuốc, sau đó nhập thông tin sử dụng</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {/* Search Input */}
            <div className='space-y-2'>
              <Label htmlFor='search-medicine'>Tìm kiếm thuốc</Label>
              <Input
                id='search-medicine'
                placeholder='Nhập tên thuốc để tìm kiếm...'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* Medicine Select */}
            <div className='space-y-2'>
              <Label htmlFor='medicine'>
                Thuốc <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={addForm.medicineId}
                onValueChange={(value) =>
                  setAddForm({ ...addForm, medicineId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn thuốc từ danh sách' />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingMedicines ? (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      Đang tải...
                    </div>
                  ) : medicines.length === 0 ? (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      {searchKeyword ? 'Không tìm thấy thuốc' : 'Nhập từ khóa để tìm kiếm'}
                    </div>
                  ) : (
                    medicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={String(medicine.id)}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{medicine.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            {medicine.concentration} - {medicine.dosageForm} - {medicine.unit}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='quantity'>
                Số lượng <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='quantity'
                type='number'
                min='1'
                value={addForm.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setAddForm({
                    ...addForm,
                    quantity: value === '' ? '' as any : Math.max(1, Number(value))
                  })
                }}
                placeholder='Nhập số lượng'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='usage'>
                Cách dùng <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='usage'
                value={addForm.usageInstructions}
                onChange={(e) =>
                  setAddForm({ ...addForm, usageInstructions: e.target.value })
                }
                placeholder='Nhập cách dùng (ví dụ: Uống 2 viên sau ăn, ngày 2 lần)...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={handleCloseAddDialog}
            >
              Hủy
            </Button>
            <Button onClick={handleAddDetail} disabled={addDetailMutation.isPending}>
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog open={isEditDetailDialogOpen} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Cập nhật thuốc</DialogTitle>
            <DialogDescription>Tìm kiếm và cập nhật thông tin thuốc trong đơn</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {/* Search Input */}
            <div className='space-y-2'>
              <Label htmlFor='edit-search-medicine'>Tìm kiếm thuốc</Label>
              <Input
                id='edit-search-medicine'
                placeholder='Nhập tên thuốc để tìm kiếm...'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* Medicine Select */}
            <div className='space-y-2'>
              <Label htmlFor='edit-medicine'>
                Thuốc <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={editForm.medicineId}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, medicineId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn thuốc từ danh sách' />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingMedicines ? (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      Đang tải...
                    </div>
                  ) : medicines.length === 0 ? (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      {searchKeyword ? 'Không tìm thấy thuốc' : 'Nhập từ khóa để tìm kiếm'}
                    </div>
                  ) : (
                    medicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={String(medicine.id)}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{medicine.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            {medicine.concentration} - {medicine.dosageForm} - {medicine.unit}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-quantity'>
                Số lượng <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='edit-quantity'
                type='number'
                min='1'
                value={editForm.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setEditForm({
                    ...editForm,
                    quantity: value === '' ? '' as any : Math.max(1, Number(value))
                  })
                }}
                placeholder='Nhập số lượng'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-usage'>
                Cách dùng <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='edit-usage'
                value={editForm.usageInstructions}
                onChange={(e) =>
                  setEditForm({ ...editForm, usageInstructions: e.target.value })
                }
                placeholder='Nhập cách dùng...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditDetailDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateDetail}
              disabled={updateDetailMutation.isPending}
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
