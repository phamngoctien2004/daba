# Chức năng Chỉ định xét nghiệm

## Mô tả
Chức năng quản lý và theo dõi các phiếu xét nghiệm (lab orders) sử dụng API endpoint `/api/lab-orders/doctor`.

## API Endpoint
```
GET /api/lab-orders/doctor
```

### Query Parameters:
- `keyword` (optional): Tìm kiếm theo mã phiếu, tên xét nghiệm
- `date` (optional): Ngày chỉ định (yyyy-MM-dd) - Mặc định: Ngày hôm nay
- `status` (optional): Trạng thái - Mặc định: CHO_THUC_HIEN
  - `CHO_THUC_HIEN`: Chờ thực hiện
  - `DANG_THUC_HIEN`: Đang thực hiện
  - `HOAN_THANH`: Hoàn thành
  - `HUY_BO`: Hủy bỏ
- `limit` (optional): Số record trên 1 trang - Mặc định: 10
- `page` (optional): Số trang - Mặc định: 1

## Cấu trúc code (tương tự Quản lý bệnh nhân)

### 1. Files cấu trúc

```
src/features/lab-orders/
├── api/
│   └── lab-orders.ts          # API functions
├── components/
│   ├── lab-orders-columns.tsx # Table columns
│   ├── lab-orders-table.tsx   # Table component
│   └── lab-orders-management.tsx # Main page component
├── hooks/
│   └── use-lab-order-medical-records.ts # React Query hook
├── types.ts                    # TypeScript types
└── index.ts                    # Public exports
```

### 2. Types

```typescript
export type LabOrderStatus = 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY_BO'

export interface LabOrder {
  id: number
  code: string
  recordId: number
  healthPlanId: number
  healthPlanName: string
  room: string
  doctorPerformed: string | null
  doctorPerformedId: number | null
  doctorOrdered: string | null
  status: LabOrderStatus
  statusPayment: string | null
  price: number
  orderDate: string
  diagnosis: string | null
  expectedResultDate: string | null
  serviceParent: string | null
  labResultResponse: LabResult | null
}
```

### 3. Main Features

#### Giao diện chính
- **Header**: Tiêu đề "Chỉ định xét nghiệm" với mô tả
- **Toolbar**:
  - Search box: Tìm theo mã phiếu, tên xét nghiệm
  - Status filter: Lọc theo trạng thái (multi-select)
  - Date picker: Chọn ngày chỉ định
  - Reset button: Đặt lại về mặc định

#### Bảng dữ liệu
Các cột:
1. **Mã phiếu XN**: Mã phiếu xét nghiệm
2. **Tên xét nghiệm**: Tên dịch vụ xét nghiệm
3. **Phòng**: Phòng thực hiện
4. **Bác sĩ thực hiện**: Tên bác sĩ thực hiện (hoặc "-")
5. **Ngày chỉ định**: Ngày và giờ chỉ định
6. **Giá**: Giá xét nghiệm (format VND)
7. **Trạng thái**: Badge với màu tương ứng
8. **Thao tác**: Nút "Xem chi tiết"

#### Filters mặc định
- **Date**: Ngày hôm nay
- **Status**: CHO_THUC_HIEN (Chờ thực hiện)

#### Pagination
- Hỗ trợ phân trang với điều khiển next/previous
- Hiển thị tổng số phiếu và phạm vi hiện tại
- Số record trên trang: 10 (mặc định)

## Menu trong Sidebar
Menu đã được cấu hình sẵn trong `role-based-nav.ts` cho role BAC_SI (Bác sĩ):
- Tên: "Chỉ định xét nghiệm"
- URL: `/lab-orders`
- Icon: Microscope

## Cách sử dụng

1. Truy cập menu "Chỉ định xét nghiệm" trong sidebar
2. Hệ thống hiển thị danh sách phiếu xét nghiệm với filter mặc định (ngày hôm nay, trạng thái CHO_THUC_HIEN)
3. Có thể:
   - Tìm kiếm theo mã phiếu hoặc tên xét nghiệm
   - Lọc theo trạng thái (chọn 1 hoặc nhiều trạng thái)
   - Chọn ngày chỉ định khác
   - Xem chi tiết phiếu xét nghiệm
   - Đặt lại filters về mặc định

## So sánh với Quản lý bệnh nhân

| Tính năng | Quản lý bệnh nhân | Chỉ định xét nghiệm |
|-----------|-------------------|---------------------|
| Layout | Header + Main | Header + Main ✅ |
| Search | Tìm theo tên, SĐT, CCCD | Tìm theo mã phiếu, tên XN ✅ |
| Filters | Không có | Status filter (multi-select) ✅ |
| Date picker | Không có | Có (ngày chỉ định) ✅ |
| Reset button | Có | Có ✅ |
| Pagination | Có | Có ✅ |
| Actions | View, Edit, Create MR | View detail ✅ |

## Trạng thái Badge Colors
- CHO_THUC_HIEN (Chờ thực hiện): Secondary (Màu xám)
- DANG_THUC_HIEN (Đang thực hiện): Default (Màu xanh primary)
- HOAN_THANH (Hoàn thành): Outline (Viền)
- HUY_BO (Hủy bỏ): Destructive (Màu đỏ)
