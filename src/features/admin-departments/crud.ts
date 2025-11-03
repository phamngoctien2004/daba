/**
 * Department CRUD Components Export
 */

export { CreateDepartmentDialog } from './components/create-department-dialog'
export { EditDepartmentDialog } from './components/edit-department-dialog'
export { DeleteDepartmentDialog } from './components/delete-department-dialog'
export { DepartmentDetailDialog } from './components/department-detail-dialog'
export { useCreateDepartment, useUpdateDepartment, useDeleteDepartment, useDepartmentDetail } from './hooks/use-departments-crud'
export type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from './types-crud'
