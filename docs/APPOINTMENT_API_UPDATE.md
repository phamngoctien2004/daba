# Cập nhật API Danh sách Lịch Khám

## Ngày cập nhật
24/10/2025

## Thay đổi cấu trúc API

### Cấu trúc cũ
```json
{
  "id": 1,
  "patientId": 5,
  "fullName": "Nguyen Van A",
  "phone": "0395527082",
  "birth": "1995-08-15",
  "gender": "NAM",
  "email": null,
  "date": "2025-10-23",
  "time": "09:30:00",
  "status": "DA_XAC_NHAN",
  "symptoms": "dff",
  "healthPlanResponse": {...},
  "doctorResponse": {...}
}
```

### Cấu trúc mới
```json
{
  "id": 49,
  "patientResponse": {
    "id": 5,
    "code": "BN1757508991380",
    "registrationDate": "2025-09-10T19:56:32",
    "fullName": "Nguyen Van A",
    "phone": "0395527082",
    "birth": "1995-08-15",
    "gender": "NAM",
    "email": null
  },
  "healthPlanResponse": null,
  "doctorResponse": {
    "id": 1,
    "position": "PGS. Phạm Tiến",
    "available": true
  },
  "date": "2025-10-23",
  "time": "09:30:00",
  "status": "DA_XAC_NHAN",
  "symptoms": "dff",
  "invoiceCode": "HD1761101888",
  "totalAmount": 6000
}
```

## Những thay đổi chính

### 1. Thông tin bệnh nhân được gom vào object `patientResponse`
- **Trước:** Thông tin bệnh nhân nằm rời rạc ở cấp độ appointment
- **Sau:** Tất cả thông tin bệnh nhân nằm trong `patientResponse`

### 2. Thêm các trường mới
- `patientResponse.code`: Mã bệnh nhân (ví dụ: "BN1757508991380")
- `patientResponse.registrationDate`: Ngày đăng ký
- `invoiceCode`: Mã hóa đơn (ví dụ: "HD1761101888")
- `totalAmount`: Tổng số tiền

### 3. Response vẫn giữ cấu trúc phân trang Spring Data
```json
{
  "data": {
    "content": [...],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 3,
      ...
    },
    "totalPages": 4,
    "totalElements": 11,
    ...
  },
  "message": "success"
}
```

## Các file đã cập nhật

### 1. `/src/features/appointments/api/appointments.ts`
**Thay đổi:**
- Thêm interface `AppointmentPatient` cho cấu trúc `patientResponse`
- Cập nhật interface `Appointment` để sử dụng `patientResponse`
- Giữ lại các trường cũ (optional) để tương thích ngược

```typescript
export interface AppointmentPatient {
  id: number
  code: string
  registrationDate: string
  fullName: string
  phone: string | null
  birth: string
  gender: 'NAM' | 'NU'
  email: string | null
}

export interface Appointment {
  id: number
  patientResponse: AppointmentPatient
  healthPlanResponse: AppointmentHealthPlan | null
  doctorResponse: AppointmentDoctor | null
  date: string
  time: string
  status: AppointmentStatus
  symptoms: string | null
  invoiceCode: string | null
  totalAmount: number
  
  // Legacy fields for backward compatibility (computed)
  patientId?: number
  fullName?: string
  phone?: string | null
  gender?: 'NAM' | 'NU'
  birth?: string
  email?: string | null
  address?: string | null
  departmentResponse?: AppointmentDepartment | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}
```

### 2. `/src/features/appointments/components/appointments-columns.tsx`
**Thay đổi:**
- Cột "Bệnh nhân": Hiển thị từ `appointment.patientResponse.fullName`
- Thêm hiển thị mã bệnh nhân: `appointment.patientResponse.code`
- Cột "Liên hệ": Sử dụng `appointment.patientResponse.phone` và `appointment.patientResponse.email`
- Cột "Lịch hẹn": Xử lý `createdAt` optional (có thể undefined)

```typescript
// Ví dụ cột Bệnh nhân
{
  accessorKey: 'patientResponse.fullName',
  header: 'Bệnh nhân',
  cell: ({ row }) => {
    const appointment = row.original
    return (
      <div className='space-y-1'>
        <div className='font-medium'>{appointment.patientResponse.fullName}</div>
        <div className='text-muted-foreground text-xs'>
          Ngày sinh: {formatDateDisplay(appointment.patientResponse.birth)}
        </div>
        <div className='text-muted-foreground text-xs'>
          Mã BN: {appointment.patientResponse.code}
        </div>
      </div>
    )
  },
}
```

### 3. `/src/features/appointments/index.tsx`
**Thay đổi:**
- Hàm `handleOpenMedicalRecord`: Sử dụng `appointment.patientResponse` để lấy thông tin bệnh nhân
- Cập nhật để truyền đúng `patientId` từ `appointment.patientResponse.id`

```typescript
const appointmentData = {
  appointmentId: appointment.id,
  patientId: appointment.patientResponse.id,
  patientName: appointment.patientResponse.fullName,
  patientPhone: appointment.patientResponse.phone,
  patientEmail: appointment.patientResponse.email,
  patientGender: appointment.patientResponse.gender,
  patientBirth: appointment.patientResponse.birth,
  // ...
}
```

## Kiểm tra và test

### 1. Kiểm tra TypeScript
```bash
pnpm tsc --noEmit --skipLibCheck
```
✅ **Kết quả:** Không có lỗi

### 2. Các tính năng cần test
- [ ] Hiển thị danh sách lịch khám
- [ ] Hiển thị mã bệnh nhân trong bảng
- [ ] Lọc lịch khám theo số điện thoại
- [ ] Lọc lịch khám theo ngày
- [ ] Lọc lịch khám theo trạng thái
- [ ] Tạo hồ sơ bệnh án từ lịch khám
- [ ] Xác nhận lịch khám
- [ ] Đánh dấu không đến

## Lưu ý quan trọng

### 1. Backward Compatibility
Interface `Appointment` vẫn giữ các trường cũ (optional) để đảm bảo code cũ không bị lỗi. Tuy nhiên, **nên migrate hoàn toàn** sang cấu trúc mới.

### 2. Mã bệnh nhân
Giờ đây có thể hiển thị mã bệnh nhân (`patientResponse.code`) trực tiếp trong bảng, giúp việc tra cứu và quản lý dễ dàng hơn.

### 3. Invoice và Amount
API mới trả về `invoiceCode` và `totalAmount`, có thể sử dụng để:
- Hiển thị mã hóa đơn khi cần
- Hiển thị tổng tiền của lịch khám
- Liên kết với module thanh toán

### 4. Registration Date
`patientResponse.registrationDate` cho biết ngày bệnh nhân đăng ký lần đầu, có thể hữu ích cho báo cáo và thống kê.

## Roadmap

### Các cải tiến tiếp theo
1. **Thêm cột mã hóa đơn và tổng tiền** vào bảng danh sách (nếu cần)
2. **Hiển thị ngày đăng ký bệnh nhân** khi hover hoặc xem chi tiết
3. **Migrate hoàn toàn** các form tạo/cập nhật appointment sang cấu trúc mới
4. **Loại bỏ các trường legacy** sau khi đảm bảo toàn bộ hệ thống sử dụng cấu trúc mới

## Kết luận

Việc cập nhật này giúp:
- ✅ Đồng bộ với API backend mới
- ✅ Tách biệt rõ ràng thông tin bệnh nhân và lịch khám
- ✅ Chuẩn bị cho các tính năng mới (invoice, payment)
- ✅ Cải thiện khả năng maintain và mở rộng

**Status:** ✅ Hoàn thành và không có lỗi TypeScript
