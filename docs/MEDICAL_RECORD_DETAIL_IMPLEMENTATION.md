# Giao diện Chi tiết Phiếu khám - Medical Record Detail Page

## Tổng quan
Đã thiết kế và triển khai hoàn chỉnh giao diện chi tiết phiếu khám bệnh dựa trên API response từ `GET /api/medical-record/{id}` và tham khảo mẫu ảnh bạn cung cấp.

## Các file đã tạo/cập nhật

### 1. Types - `/src/features/medical-records/types.ts`
✅ **Đã thêm:**
- `InvoiceDetailStatus`: Trạng thái thanh toán (DA_THANH_TOAN, CHUA_THANH_TOAN)
- `LabOrderStatus`: Trạng thái xét nghiệm (CHO_THUC_HIEN, DANG_THUC_HIEN, HOAN_THANH, HUY)
- `LabOrderItem`: Interface cho từng xét nghiệm
- `InvoiceDetail`: Interface cho chi tiết hóa đơn với:
  - `multipleLab`: Mảng xét nghiệm (cho gói nhiều dịch vụ)
  - `singleLab`: Xét nghiệm đơn lẻ
  - `typeService`: 'MULTIPLE' | 'SINGLE'
- `MedicalRecordDetail`: Extends MedicalRecord với đầy đủ thông tin

### 2. API Functions - `/src/features/medical-records/api/medical-records.ts`
✅ **Đã thêm:**
- `fetchMedicalRecordDetail(id: string)`: Lấy chi tiết phiếu khám với đầy đủ thông tin invoices và lab orders
- `updateMedicalRecord(payload)`: Cập nhật thông tin khám (clinicalExamination, diagnosis, treatmentPlan, note)
- `updateMedicalRecordStatus(payload)`: Cập nhật trạng thái phiếu khám

### 3. Custom Hooks - `/src/features/medical-records/hooks/use-medical-record-detail.ts`
✅ **Đã tạo mới:**
- `useMedicalRecordDetail(id)`: Hook để fetch chi tiết phiếu khám
- `useUpdateMedicalRecord()`: Hook để cập nhật thông tin khám
- `useUpdateMedicalRecordStatus()`: Hook để cập nhật trạng thái

### 4. Component - `/src/features/medical-records/components/medical-record-detail-page.tsx`
✅ **Đã tạo component chính với các section:**

#### Header Section
- Mã phiếu khám (PK{timestamp})
- Badge trạng thái với màu sắc phù hợp
- Nút "Quay lại"

#### Thông tin Bệnh nhân (Patient Information Card)
- Họ và tên
- Số điện thoại
- Giới tính
- Địa chỉ
- Ngày khám (format: HH:mm dd/MM/yyyy)
- Triệu chứng

#### Chi tiết Dịch vụ (Service Details)
Mỗi invoice detail hiển thị trong một Card riêng với:
- Tên dịch vụ/gói khám
- Mô tả
- Badge trạng thái thanh toán
- Giá dịch vụ
- Đã thanh toán
- Còn lại (nếu có)
- Loại dịch vụ (Gói nhiều dịch vụ/Dịch vụ đơn)

**Chi tiết Xét nghiệm (Expandable):**
- Nút mở rộng/thu gọn với icon
- Hiển thị số lượng mục
- Mỗi xét nghiệm hiển thị:
  - Tên xét nghiệm
  - Mã xét nghiệm
  - Phòng thực hiện
  - Bác sĩ thực hiện (nếu có)
  - Thời gian tạo
  - Badge trạng thái

#### Tổng thanh toán (Summary Card)
- Tổng cộng
- Đã thanh toán (màu xanh)
- Còn lại (màu đỏ, nếu có)

#### Action Buttons
- Quay lại danh sách
- Đang khám (disabled - placeholder cho các action khác)

### 5. Route - `/src/routes/_authenticated/medical-records/$id.tsx`
✅ **Đã cập nhật:**
- Import và sử dụng `MedicalRecordDetailPage`
- Lấy `id` từ route params
- Layout với Header và Main

### 6. Navigation - `/src/features/medical-records/index.tsx`
✅ **Đã cập nhật:**
- `handleViewDetail`: Navigate đến `/medical-records/$id` thay vì hiển thị toast

## Features chính

### 1. Responsive Design
- Grid layout tự động điều chỉnh trên mobile/desktop
- Cards stack vertically trên màn hình nhỏ

### 2. Loading States
- Skeleton components khi đang fetch data
- Hiển thị thông báo loading phù hợp

### 3. Error Handling
- Hiển thị thông báo lỗi rõ ràng khi không tìm thấy phiếu khám
- Nút "Quay lại" để user có thể navigate

### 4. Expandable Lab Orders
- Mặc định thu gọn để giao diện gọn gàng
- Click để xem chi tiết các xét nghiệm
- Icon ChevronUp/ChevronDown thay đổi theo trạng thái

### 5. Status Badges
- Màu sắc phù hợp với từng trạng thái:
  - **Đang khám**: default (blue)
  - **Chờ xét nghiệm**: secondary (gray)
  - **Hoàn thành**: outline (green border)
  - **Hủy**: destructive (red)

### 6. Vietnamese Localization
- Format ngày giờ theo locale Việt Nam
- Định dạng số tiền: 5,000 đ
- Tất cả label và text bằng tiếng Việt

## Cách sử dụng

### Từ danh sách phiếu khám:
1. Click vào nút "Xem" trong bảng Medical Records
2. Tự động navigate đến `/medical-records/{id}`
3. Hiển thị chi tiết đầy đủ thông tin

### Truy cập trực tiếp:
- URL: `/medical-records/{id}` (ví dụ: `/medical-records/111`)

## API Integration

### Endpoint đã tích hợp:
- ✅ `GET /api/medical-record/{id}` - Fetch chi tiết phiếu khám
- ✅ `PUT /api/medical-record` - Cập nhật thông tin (API ready)
- ✅ `PUT /api/medical-record/status` - Cập nhật trạng thái (API ready)

## Các tính năng sẽ mở rộng

### Phase 2 (Chưa implement):
- [ ] Form chỉnh sửa thông tin khám (clinicalExamination, diagnosis, treatmentPlan, note)
- [ ] Nút "Lưu tạm" để cập nhật thông tin
- [ ] Nút "Chỉ định xét nghiệm" mở modal/drawer
- [ ] Nút "Kê đơn thuốc" mở drawer
- [ ] Nút "Hoàn thành" với confirmation dialog
- [ ] Nút "Hủy" với confirmation dialog
- [ ] In phiếu khám (GET /api/html/medical-record/{id})
- [ ] In hóa đơn (GET /api/html/invoice/{medicalRecordId})
- [ ] Hiển thị prescriptions (nếu có)
- [ ] Real-time update khi status thay đổi

## Screenshot mẫu

Giao diện đã thiết kế theo cấu trúc:
```
┌─────────────────────────────────────┐
│ ← Phiếu khám bệnh    [Badge Status] │
│ Mã phiếu: PK1760023951              │
├─────────────────────────────────────┤
│ 👤 Thông tin bệnh nhân              │
│ ┌─────────────┬─────────────┐       │
│ │ Họ tên      │ SĐT         │       │
│ │ Giới tính   │ Địa chỉ     │       │
│ │ Ngày khám   │ Triệu chứng │       │
│ └─────────────┴─────────────┘       │
├─────────────────────────────────────┤
│ Chi tiết dịch vụ                    │
│ ┌───────────────────────────────┐   │
│ │ GOI DICH VU...  [Đã thanh toán]│  │
│ │ Giá: 5,000 đ                  │   │
│ │ Đã TT: 5,000 đ                │   │
│ │ ▼ Xem chi tiết (6 mục)        │   │
│ │   • Khám bệnh                 │   │
│ │   • XN công thức máu          │   │
│ │   • Nội soi dạ dày            │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ Tổng thanh toán                     │
│ Tổng: 7,000 đ                       │
│ Đã TT: 5,000 đ                      │
│ Còn lại: 2,000 đ                    │
├─────────────────────────────────────┤
│ [← Quay lại] [Đang khám]            │
└─────────────────────────────────────┘
```

## Testing
Để test giao diện:
1. Start dev server: `pnpm dev`
2. Navigate đến danh sách phiếu khám: `/medical-records`
3. Click "Xem" trên bất kỳ phiếu khám nào
4. Hoặc truy cập trực tiếp: `/medical-records/111`

## Notes
- Component sử dụng shadcn/ui components đã có trong project
- Tuân thủ pattern của project (TanStack Router, TanStack Query, TypeScript)
- Code đã format theo coding style của project (2 spaces, single quotes)
- Tất cả types đã được định nghĩa rõ ràng
- Error handling đầy đủ
