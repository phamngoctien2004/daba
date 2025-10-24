# Cập nhật Tạo Phiếu Khám - Tích hợp Lịch Đặt và Hiển thị Thông tin

## Ngày cập nhật
24/10/2025

## Tổng quan

Cập nhật này bổ sung các tính năng mới cho module tạo phiếu khám:
1. **Ghi nhớ appointmentId** và thông tin thanh toán từ lịch đặt
2. **Hiển thị "Thanh toán thành công"** khi tạo phiếu từ lịch đã thanh toán
3. **Lọc bác sĩ theo lịch làm việc** (chỉ hiển thị bác sĩ available)
4. **Hiển thị thông tin chi tiết** về phòng khám và dịch vụ

---

## 1. Cập nhật Appointment Storage

### File: `src/lib/appointment-storage.ts`

**Thêm các trường mới:**
```typescript
export interface AppointmentDataForMedicalRecord {
  // ... existing fields
  
  // Payment info from appointment (nếu đã thanh toán khi đặt lịch)
  isPaidFromAppointment?: boolean
  totalAmount?: number
  invoiceCode?: string | null
}
```

**Mục đích:**
- Lưu trạng thái thanh toán từ lịch đặt
- Phân biệt bệnh nhân đặt lịch trước (đã thanh toán) vs bệnh nhân walk-in

---

## 2. API Client cho Schedules

### File: `src/features/schedules/api/schedules.ts` (MỚI)

**Các functions chính:**

#### `getCurrentShift(): Shift`
Tự động tính ca làm việc dựa trên giờ hiện tại:
- **SANG**: 7h - 12h
- **CHIEU**: 12h - 17h  
- **TOI**: 17h - 22h

#### `getTodayDate(): string`
Trả về ngày hôm nay định dạng `yyyy-MM-dd`

#### `fetchAvailableSchedules(params)`
Gọi API `GET /api/schedules/available` với params:
- `startDate`: Ngày bắt đầu
- `endDate`: Ngày kết thúc
- `doctorId` (optional): ID bác sĩ
- `shift` (optional): Ca làm việc

#### `fetchAvailableDoctorsToday(): Promise<AvailableDoctor[]>`
**Hàm tiện ích** tự động:
1. Lấy ngày hôm nay
2. Tính ca làm việc hiện tại
3. Gọi API schedules/available
4. **Chỉ trả về bác sĩ có `available = true`**

**Response structure:**
```typescript
interface AvailableDoctor {
  id: number
  fullName: string
  position: string
  available: boolean  // CHỈ trả về true
  roomName: string    // Thông tin phòng khám
  invalidTimes: string[]
  shift: Shift
}
```

---

## 3. API Client cho Service Detail

### File: `src/features/health-plans/api/services.ts`

**Thêm các interfaces:**

```typescript
// Sub-plan trong gói dịch vụ
interface ServiceSubPlan {
  id: number
  code: string
  name: string
  price: number
  roomName: string
}

// Dịch vụ gói (có sub-plans)
interface ServicePackageDetail {
  id: number
  code: string
  name: string
  price: number
  type: 'DICH_VU'
  subPlans: ServiceSubPlan[]
}

// Dịch vụ lẻ (có roomName)
interface ServiceSingleDetail {
  id: number
  code: string
  name: string
  price: number
  roomName: string
  type: HealthPlanType
}

type ServiceDetail = ServicePackageDetail | ServiceSingleDetail
```

**Thêm function:**

#### `fetchServiceDetail(id: number): Promise<ServiceDetail | null>`
Gọi API `GET /api/services/optional/{id}` để lấy chi tiết dịch vụ.

**Xử lý 2 trường hợp:**
1. **Dịch vụ gói** (`subPlans` array) - Hiển thị danh sách dịch vụ con
2. **Dịch vụ lẻ** (`roomName` string) - Hiển thị phòng thực hiện

**Type guards:**
- `isServicePackage(service)`: Kiểm tra có `subPlans`
- `isServiceSingle(service)`: Kiểm tra có `roomName`

---

## 4. Cập nhật Create Medical Record Form

### File: `src/features/medical-records/components/create-medical-record-form.tsx`

### 4.1. Lưu thông tin thanh toán từ appointment

**Trong `appointments/index.tsx`:**
```typescript
const appointmentData = {
  // ... existing fields
  
  // Payment info (đã thanh toán khi đặt lịch)
  isPaidFromAppointment: appointment.status === 'DA_XAC_NHAN' && !!appointment.invoiceCode,
  totalAmount: appointment.totalAmount ?? 0,
  invoiceCode: appointment.invoiceCode ?? null,
}
```

### 4.2. Hiển thị Payment Status/Method

**Khi `isPaidFromAppointment = true`:**
```tsx
<div className="rounded-lg border border-green-200 bg-green-50">
  <h4>Thanh toán thành công</h4>
  <p>Số tiền: {appointmentData.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
  <p>Mã hóa đơn: {appointmentData.invoiceCode}</p>
  <p>Đã thanh toán khi đặt lịch khám</p>
</div>
```

**Khi `isPaidFromAppointment = false`:**
- Hiển thị radio buttons chọn phương thức thanh toán (Tiền mặt / QR)

### 4.3. Thay đổi label nút submit

```tsx
<Button type="submit">
  {appointmentData?.isPaidFromAppointment 
    ? 'Tạo phiếu khám'      // Từ lịch đặt
    : 'Xác nhận thanh toán' // Walk-in
  }
</Button>
```

### 4.4. Load Available Doctors

**Thay đổi logic load doctors:**
```typescript
// CŨ: Gọi fetchAllDoctors()
const allDoctors = await fetchAllDoctors()

// MỚI: Gọi fetchAvailableDoctorsToday()
const availableDoctors = await fetchAvailableDoctorsToday()
// Tự động lọc theo:
// - startDate = endDate = hôm nay
// - shift = ca hiện tại
// - available = true
```

**Fallback:** Nếu API schedules lỗi, tự động fallback về `fetchAllDoctors()`

### 4.5. Hiển thị thông tin Doctor

```tsx
{selectedDoctor && (
  <div className="rounded-lg border bg-blue-50">
    <h4>Thông tin bác sĩ</h4>
    <div>Bác sĩ: {selectedDoctor.position}</div>
    <div>Phòng khám: {selectedDoctor.roomName}</div>
    <div>Chi phí: {selectedDoctor.examinationFee.toLocaleString('vi-VN')} VNĐ</div>
  </div>
)}
```

### 4.6. Load và hiển thị Service Detail

**Load khi chọn service:**
```typescript
onValueChange={async (value) => {
  const healthPlanId = Number(value)
  
  // Load service detail
  const { fetchServiceDetail } = await import('@/features/health-plans/api/services')
  const detail = await fetchServiceDetail(healthPlanId)
  setServiceDetail(detail)
}}
```

**Hiển thị Service Package (có subPlans):**
```tsx
{serviceDetail.subPlans && (
  <div className="rounded-lg border bg-purple-50">
    <h4>Thông tin dịch vụ</h4>
    <div>Gói dịch vụ: {serviceDetail.name}</div>
    <div>Bao gồm {serviceDetail.subPlans.length} dịch vụ:</div>
    
    {serviceDetail.subPlans.map(subPlan => (
      <div key={subPlan.id}>
        <p>{subPlan.name}</p>
        <p>{subPlan.roomName}</p>
        <p>{subPlan.price.toLocaleString('vi-VN')} VNĐ</p>
      </div>
    ))}
    
    <div>Tổng chi phí: {serviceDetail.price.toLocaleString('vi-VN')} VNĐ</div>
  </div>
)}
```

**Hiển thị Single Service (có roomName):**
```tsx
{serviceDetail.roomName && !serviceDetail.subPlans && (
  <div className="rounded-lg border bg-purple-50">
    <h4>Thông tin dịch vụ</h4>
    <div>Dịch vụ: {serviceDetail.name}</div>
    <div>Phòng: {serviceDetail.roomName}</div>
    <div>Chi phí: {serviceDetail.price.toLocaleString('vi-VN')} VNĐ</div>
  </div>
)}
```

---

## 5. Flow Hoạt động

### Kịch bản 1: Tạo phiếu từ lịch đặt (đã thanh toán)

```
1. Lễ tân xem danh sách lịch khám
   └─> Bấm "Tạo phiếu khám" trên dòng appointment

2. Hệ thống lưu appointmentData vào localStorage
   ├─> appointmentId: 123
   ├─> isPaidFromAppointment: true
   ├─> totalAmount: 150000
   └─> invoiceCode: "HD1761101888"

3. Navigate đến /appointments/record/create

4. Form load và hiển thị:
   ├─> ✅ Thông tin bệnh nhân (auto-fill)
   ├─> ✅ "Thanh toán thành công - 150,000 VNĐ"
   ├─> ⚠️  KHÔNG hiển thị chọn phương thức thanh toán
   └─> 🔵 Nút "Tạo phiếu khám" (không phải "Xác nhận thanh toán")

5. Chọn loại khám → Bác sĩ/Dịch vụ
   └─> Hiển thị thông tin phòng khám

6. Bấm "Tạo phiếu khám"
   └─> Tạo medical record thành công
```

### Kịch bản 2: Bệnh nhân walk-in (chưa thanh toán)

```
1. Lễ tân chọn "Tạo phiếu khám mới" (không từ appointment)

2. isPaidFromAppointment = undefined/false

3. Form hiển thị:
   ├─> ⚠️  Nhập thông tin bệnh nhân
   ├─> 🔵 Chọn phương thức thanh toán (Tiền mặt/QR)
   └─> 🔵 Nút "Xác nhận thanh toán"

4. Chọn loại khám → Load available doctors
   └─> Chỉ hiển thị bác sĩ available = true trong ca hiện tại

5. Bấm "Xác nhận thanh toán"
   └─> Xử lý thanh toán → Tạo medical record
```

---

## 6. API Endpoints Sử dụng

### 6.1. GET /api/schedules/available
**Query params:**
- `startDate`: yyyy-MM-dd (required)
- `endDate`: yyyy-MM-dd (required)
- `shift`: SANG | CHIEU | TOI (optional)
- `doctorId`: number (optional)

**Response:**
```json
{
  "data": [
    {
      "date": "2025-10-20",
      "dateName": "MONDAY",
      "totalSlot": 2,
      "doctors": [
        {
          "id": 1,
          "fullName": "tien",
          "position": "PGS. Phạm Tiến",
          "available": true,
          "roomName": "phong A",
          "invalidTimes": ["09:00:00"],
          "shift": "SANG"
        }
      ]
    }
  ]
}
```

### 6.2. GET /api/services/optional/{id}

**Response - Dịch vụ gói:**
```json
{
  "data": {
    "id": 12,
    "code": "DV_001",
    "name": "Gói khám tổng quát",
    "price": 5000.0,
    "type": "DICH_VU",
    "subPlans": [
      {
        "id": 17,
        "code": "XN_NUOC_TIEU",
        "name": "Xét nghiệm nước tiểu",
        "price": 2000.0,
        "roomName": "Phòng khám khoa xét nghiệm - 204A"
      }
    ]
  }
}
```

**Response - Dịch vụ lẻ:**
```json
{
  "data": {
    "id": 18,
    "code": "XN_SINH_HOA",
    "name": "Xét nghiệm sinh hóa",
    "price": 2000.0,
    "roomName": "Phòng khám khoa xét nghiệm - 204A",
    "type": "XET_NGHIEM"
  }
}
```

---

## 7. Danh sách Files Thay đổi

### Files mới tạo:
1. ✅ `src/features/schedules/api/schedules.ts`

### Files cập nhật:
1. ✅ `src/lib/appointment-storage.ts`
2. ✅ `src/features/appointments/index.tsx`
3. ✅ `src/features/health-plans/api/services.ts`
4. ✅ `src/features/medical-records/components/create-medical-record-form.tsx`

---

## 8. Testing Checklist

### Tạo phiếu từ lịch đặt
- [ ] Hiển thị "Thanh toán thành công" với số tiền và mã hóa đơn
- [ ] Nút hiển thị "Tạo phiếu khám" (không phải "Xác nhận thanh toán")
- [ ] Không hiển thị chọn phương thức thanh toán
- [ ] Tạo phiếu thành công

### Load bác sĩ available
- [ ] Chỉ hiển thị bác sĩ trong ca làm việc hiện tại
- [ ] Chỉ hiển thị bác sĩ có `available = true`
- [ ] Hiển thị thông tin phòng khám của bác sĩ

### Hiển thị thông tin dịch vụ
- [ ] **Dịch vụ gói**: Hiển thị danh sách sub-plans với phòng và giá
- [ ] **Dịch vụ lẻ**: Hiển thị phòng thực hiện và giá
- [ ] Tổng chi phí hiển thị đúng

### Walk-in patient
- [ ] Hiển thị chọn phương thức thanh toán
- [ ] Nút hiển thị "Xác nhận thanh toán"
- [ ] Load bác sĩ available thành công
- [ ] Tạo phiếu và thanh toán thành công

---

## 9. Cải tiến So với Trước

| Tính năng | Trước | Sau |
|-----------|-------|-----|
| Lọc bác sĩ | Hiển thị tất cả | Chỉ available trong ca hiện tại |
| Thông tin phòng | Không hiển thị | Hiển thị roomName |
| Dịch vụ gói | Chỉ tên + giá | Hiển thị chi tiết subPlans |
| Payment từ appointment | Vẫn chọn phương thức | Hiển thị "Đã thanh toán" |
| UX | Confusing | Rõ ràng, phân biệt 2 flow |

---

## 10. Lưu ý Quan trọng

### Shift Calculation
- **7:00 - 11:59**: SANG
- **12:00 - 16:59**: CHIEU  
- **17:00 - 22:00**: TOI

Nếu bác sĩ không available trong ca hiện tại, họ sẽ **không xuất hiện** trong danh sách.

### Fallback Mechanism
Nếu API `/schedules/available` lỗi, hệ thống tự động fallback về `fetchAllDoctors()` để đảm bảo không block workflow.

### Type Safety
Tất cả response đều có TypeScript interfaces đầy đủ. Sử dụng type guards (`isServicePackage`, `isServiceSingle`) để phân biệt 2 loại dịch vụ.

---

## Kết luận

Cập nhật này hoàn thành đầy đủ các yêu cầu:

✅ Ghi nhớ appointmentId và payment status  
✅ Hiển thị "Thanh toán thành công" cho lịch đã thanh toán  
✅ Nút "Tạo phiếu khám" thay vì "Xác nhận thanh toán"  
✅ Lọc bác sĩ theo lịch làm việc (available only)  
✅ Hiển thị thông tin phòng khám cho bác sĩ  
✅ Hiển thị chi tiết dịch vụ (2 trường hợp: gói + lẻ)  

**Status:** ✅ Hoàn thành, không có lỗi TypeScript
