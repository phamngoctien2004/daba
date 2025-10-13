# FRONTEND COMPONENTS TODO

**Dự án:** Hệ thống Quản lý Phòng khám
**Ngày cập nhật:** 2025-10-13

---

## 📋 MỤC LỤC

1. [Shared Components](#1-shared-components)
2. [Patients Module](#2-patients-module)
3. [Appointments Module](#3-appointments-module)
4. [Medical Records Module](#4-medical-records-module)
5. [Payments Module](#5-payments-module)
6. [Lab Orders Module](#6-lab-orders-module)
7. [Prescriptions Module](#7-prescriptions-module)
8. [Validation & Forms](#8-validation--forms)
9. [State Management](#9-state-management)

---

## 1. 🧩 SHARED COMPONENTS

### 1.1 Input Components

#### TimePicker Component
- ❌ **Status:** Chưa có
- **Priority:** P0
- **File:** `src/components/time-picker.tsx`
- **Requirements:**
  - Input với format HH:mm (24h)
  - Native HTML time input hoặc custom picker
  - Validation: 00:00 - 23:59
  - Props:
    ```tsx
    interface TimePickerProps {
      value: string // "14:30"
      onChange: (value: string) => void
      disabled?: boolean
      min?: string
      max?: string
      className?: string
    }
    ```
  - Error states
  - Integration với react-hook-form

#### PhoneInput Component
- ❌ **Status:** Chưa có
- **Priority:** P0
- **File:** `src/components/phone-input.tsx`
- **Requirements:**
  - Input với pattern ^0\d{9}$
  - Auto format: 0912345678 → 091 234 5678 (display only)
  - Real-time validation
  - Props:
    ```tsx
    interface PhoneInputProps {
      value: string
      onChange: (value: string) => void
      error?: string
      disabled?: boolean
      placeholder?: string
    }
    ```
  - Vietnamese phone number specific
  - Integration với react-hook-form

#### CCCDInput Component
- ❌ **Status:** Chưa có
- **Priority:** P1
- **File:** `src/components/cccd-input.tsx`
- **Requirements:**
  - Input với pattern ^\d{9,12}$
  - Auto format: 12 digits → 001 234 567 890
  - Real-time validation
  - Unique check indicator (loading spinner khi check)
  - Props:
    ```tsx
    interface CCCDInputProps {
      value: string
      onChange: (value: string) => void
      error?: string
      isChecking?: boolean
      isUnique?: boolean
      disabled?: boolean
    }
    ```

#### SearchableSelect Component
- ❌ **Status:** Chưa có
- **Priority:** P0
- **File:** `src/components/searchable-select.tsx`
- **Requirements:**
  - Typeahead/autocomplete functionality
  - Debounced search (300-500ms)
  - Loading states
  - Empty state
  - Keyboard navigation
  - Props:
    ```tsx
    interface SearchableSelectProps<T> {
      options: T[]
      value: T | null
      onChange: (value: T | null) => void
      onSearch: (query: string) => void
      isLoading?: boolean
      getLabel: (item: T) => string
      getValue: (item: T) => string | number
      placeholder?: string
      emptyText?: string
    }
    ```
  - Dùng cho: patient search, doctor search, medicine search, service search

### 1.2 Display Components

#### StatusBadge Component
- ❌ **Status:** Chưa có (có một phần trong appointments)
- **Priority:** P1
- **File:** `src/components/status-badge.tsx`
- **Requirements:**
  - Generic component cho tất cả status types
  - Props:
    ```tsx
    type StatusType = 'appointment' | 'medicalRecord' | 'labOrder' | 'payment'

    interface StatusBadgeProps {
      type: StatusType
      status: string
      variant?: BadgeProps['variant']
      className?: string
    }
    ```
  - Auto mapping status → variant + label
  - Reusable cho nhiều modules

#### QRCodeDisplay Component
- ❌ **Status:** Chưa có
- **Priority:** P1
- **File:** `src/components/qr-code-display.tsx`
- **Requirements:**
  - Hiển thị QR code image (base64 hoặc URL)
  - Countdown timer (5 phút)
  - Auto refresh/polling indicator
  - Props:
    ```tsx
    interface QRCodeDisplayProps {
      qrCode: string // base64 or URL
      orderCode: number
      expiresIn: number // seconds
      onExpire: () => void
      isPolling?: boolean
    }
    ```
  - Visual countdown (circular progress hoặc linear)
  - Responsive sizing

#### PatientCard Component
- ❌ **Status:** Chưa có
- **Priority:** P2
- **File:** `src/components/patient-card.tsx`
- **Requirements:**
  - Compact patient info display
  - Used in: appointment detail, medical record detail
  - Props:
    ```tsx
    interface PatientCardProps {
      patient: {
        id: number
        code: string
        fullName: string
        phone?: string
        email?: string
        birth: string
        gender: 'NAM' | 'NU'
        bloodType: string
      }
      showDetails?: boolean
      className?: string
    }
    ```
  - Avatar/profile image
  - Badges for gender, blood type

### 1.3 Data Table Enhancements

#### DataTableDateFilter
- ❌ **Status:** Chưa có (có logic trong appointments-table)
- **Priority:** P2
- **File:** `src/components/data-table/date-filter.tsx`
- **Requirements:**
  - Reusable date filter component
  - DatePicker integration
  - URL state sync
  - Props:
    ```tsx
    interface DataTableDateFilterProps {
      value: string
      onChange: (value: string) => void
      label: string
      className?: string
    }
    ```

---

## 2. 👤 PATIENTS MODULE

### 2.1 Patient Search Component
- ❌ **Status:** Chưa có
- **Priority:** P0 (blocking appointment creation)
- **File:** `src/features/patients/components/patient-search.tsx`
- **Used In:** Create Appointment Form
- **Requirements:**
  - SearchableSelect integration
  - Search by: phone, name, CCCD
  - Debounced API call: GET /api/patients?keyword={query}
  - Display: code, fullName, phone, birth
  - Button "Tạo bệnh nhân mới" khi không tìm thấy
  - Props:
    ```tsx
    interface PatientSearchProps {
      onSelect: (patient: Patient) => void
      onCreateNew: () => void
      value?: Patient | null
    }
    ```

### 2.2 Create/Edit Patient Form
- ❌ **Status:** Chưa có
- **Priority:** P0
- **File:** `src/features/patients/components/patient-form.tsx`
- **Requirements:**

**Form Fields:**
```tsx
{
  phone: string | null         // PhoneInput, optional
  email: string | null         // Input type="email", optional
  fullName: string             // Input, required, maxLength: 100
  address: string              // Textarea, required, maxLength: 255
  cccd: string                 // CCCDInput, required, pattern: ^\d{9,12}$, unique
  birth: string                // DatePicker, required, <= today
  gender: 'NAM' | 'NU'        // Radio group, required
  bloodType: 'A'|'B'|'AB'|'O' // Select, required
  weight: number               // Input type="number", 0-500, required
  height: number               // Input type="number", 0-300, required
  profileImage: string | null  // File upload, optional
  phoneLink: string | null     // PhoneInput, optional
}
```

**Validation (Zod schema):**
- [x] Phone pattern: ^0\d{9}$
- [x] Email format
- [x] CCCD pattern + unique check
- [x] Birth <= today
- [x] Gender enum
- [x] BloodType enum
- [x] Weight 0-500
- [x] Height 0-300

**API Integration:**
- POST /api/patients (create mode)
- PUT /api/patients/{id} (edit mode)
- X-Idempotency-Key header

**Error Handling:**
- 409: CCCD đã tồn tại
- 400: Validation errors
- Display gợi ý khi phone đã tồn tại

**Props:**
```tsx
interface PatientFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Patient>
  onSuccess: (patient: Patient) => void
  onCancel: () => void
}
```

### 2.3 Patients List/Table
- ❌ **Status:** Chưa có
- **Priority:** P2
- **File:** `src/features/patients/components/patients-table.tsx`
- **Requirements:**
  - Similar to AppointmentsTable pattern
  - Columns:
    - code (BN{timestamp})
    - fullName
    - phone
    - cccd
    - gender (badge)
    - birth (formatted)
    - bloodType (badge)
    - createdAt
    - Actions: [Xem] [Sửa]
  - Filters:
    - Search by phone, name, CCCD
    - Filter by gender
    - Filter by bloodType
  - Pagination (URL state)
  - API: GET /api/patients

### 2.4 Patient Detail Page
- ❌ **Status:** Chưa có
- **Priority:** P2
- **File:** `src/features/patients/components/patient-detail.tsx` và route
- **Route:** `/patients/{id}`
- **Requirements:**
  - Tab 1: Thông tin cá nhân (PatientCard)
    - Button [Sửa]
  - Tab 2: Lịch sử khám bệnh (UC009)
    - API: GET /api/medical-record/patient/{patientId}
    - Sort by date desc
    - Highlight status=DANG_KHAM
    - Click → navigate to medical record detail
  - Tab 3: Thống kê (optional, P3)

---

## 3. 📅 APPOINTMENTS MODULE

### 3.1 Create Appointment Form
- ⚠️ **Status:** File có, cần review implementation
- **Priority:** P0
- **File:** `src/features/appointments/components/create-appointment-form.tsx`
- **Requirements:**

**Form Fields:**
```tsx
{
  patientId: number           // Patient Search component, required
  departmentId: number        // Select, required
  doctorId: number            // Select (filtered by department), required
  appointmentDate: string     // DatePicker, required, format: YYYY-MM-DD
  appointmentTime: string     // TimePicker, required, format: HH:mm
  symptoms: string            // Textarea, optional, maxLength: 1000
  notes: string               // Textarea, optional, maxLength: 500
}
```

**Flow:**
1. Search/select patient (PatientSearch component)
   - If not found → Button "Tạo bệnh nhân mới" → PatientForm modal → On success → auto select patient
2. Select department → Load doctors by department
3. Select doctor (only available=true doctors)
4. Pick date & time
5. Enter symptoms & notes

**Validation:**
- appointmentDate + appointmentTime > now
- Doctor available at selected datetime

**API Integration:**
- GET /api/departments
- GET /api/doctors?departmentId={id}&available=true
- POST /api/appointments
- X-Idempotency-Key header

**Error Handling:**
- 409: Bác sĩ không khả dụng
- 400: Validation errors

**TODO Checklist:**
- [ ] Review existing implementation
- [ ] Add PatientSearch integration
- [ ] Add TimePicker
- [ ] Add date/time validation
- [ ] Add doctor availability check
- [ ] Add idempotency key
- [ ] Test all error cases

### 3.2 Simple Appointment Form
- ⚠️ **Status:** File có, chưa rõ mục đích
- **Priority:** P3
- **File:** `src/features/appointments/components/simple-appointment-form.tsx`
- **TODO:**
  - [ ] Xác định use case
  - [ ] Implement hoặc remove nếu không cần

### 3.3 Appointment Filters
- ⚠️ **Status:** File có, có thể đã integrate vào table
- **Priority:** P2
- **File:** `src/features/appointments/components/appointment-filters.tsx`
- **TODO:**
  - [ ] Review existing implementation
  - [ ] Extract reusable logic nếu cần

---

## 4. 🏥 MEDICAL RECORDS MODULE

### 4.1 Create Medical Record Form (from Appointment)
- ❌ **Status:** Chưa có
- **Priority:** P0
- **File:** `src/routes/_authenticated/appointments/create-medical-record/$appointmentId.tsx`
- **Route:** `/appointments/create-medical-record/{appointmentId}`
- **Requirements:**

**Auto-fill from Appointment:**
- Patient info (read-only display)
- Doctor (from appointment)
- Symptoms (pre-filled, editable)

**Form Fields:**
```tsx
{
  patientId: number         // Auto-filled from appointment
  doctorId: number | null   // Auto-filled from appointment, editable
  healthPlanId: number | null // Select health plan/service
  symptoms: string          // Textarea, pre-filled, required, maxLength: 2000
  paymentMethod: 'cash' | 'qr' // Radio group
}
```

**Fee Calculation:**
- Display calculated fee from healthPlan.price or doctor.examinationFee
- Auto update when healthPlan changes

**Payment Flow:**

**Cash:**
1. Select [Cash]
2. Submit → POST /api/medical-record với invoiceId=undefined
3. Success → Navigate to medical record detail page

**QR:**
1. Select [QR]
2. Submit → POST /api/payments/create-link
3. Open QRPaymentModal
4. Poll GET /api/payments/status/{orderCode}
5. On success → POST /api/medical-record với invoiceId
6. Navigate to medical record detail page

**Components needed:**
- PatientCard (display patient info)
- HealthPlan/Service SearchableSelect
- Doctor SearchableSelect
- PaymentMethodSelector (Radio group)
- QRPaymentModal (see Payments section)

**API Integration:**
- GET /api/appointments/{id} (get appointment data)
- GET /api/services?keyword={query}
- GET /api/doctors?available=true
- POST /api/medical-record (cash)
- POST /api/payments/create-link (QR)
- GET /api/payments/status/{orderCode} (polling)
- POST /api/medical-record (after QR success)

### 4.2 Medical Record Detail Page
- ❌ **Status:** Chưa có
- **Priority:** P0
- **File:** `src/features/medical-records/components/medical-record-detail.tsx` và route
- **Route:** `/medical-records/{id}`
- **Requirements:**

**Header Section:**
- Medical record code (PK{timestamp})
- Patient info (PatientCard)
- Status badge
- Created date
- Doctor info

**Main Form (for BAC_SI role):**
```tsx
{
  symptoms: string                // Read-only or editable, depending on status
  clinicalExamination: string     // Textarea, optional
  diagnosis: string               // Textarea, optional
  treatmentPlan: string           // Textarea, optional
  note: string                    // Textarea, optional
}
```

**Action Buttons:**
- [Lưu tạm] - PUT /api/medical-record (update fields)
  - Guard: status = DANG_KHAM hoặc CHO_XET_NGHIEM
  - Loading state
- [Chỉ định xét nghiệm] - Open CreateLabOrderModal
  - Guard: status = DANG_KHAM
- [Kê đơn thuốc] - Open CreatePrescriptionDrawer
  - Guard: status = DANG_KHAM
- [Hoàn thành] - PUT /api/medical-record/status (HOAN_THANH)
  - Guard: status = DANG_KHAM hoặc CHO_XET_NGHIEM, diagnosis not null
  - Confirmation dialog
- [Hủy] - PUT /api/medical-record/status (HUY)
  - Guard: status = DANG_KHAM hoặc CHO_XET_NGHIEM
  - Confirmation dialog
- [In phiếu khám] - GET /api/html/medical-record/{id} → window.print()
- [In hóa đơn] - GET /api/html/invoice/{medicalRecordId} → window.print()

**Related Data Sections:**

**Lab Orders (if any):**
- Display list of lab orders
- Columns: code, service name, performing doctor, status, actions
- Actions: [Xem kết quả] (if HOAN_THANH)

**Prescriptions (if any):**
- Display list of prescriptions
- Expandable: show medicine details
- Columns: code, general instructions, created date

**Invoice Details:**
- Display invoice info
- Service charges
- Total & paid amounts
- Payment status

**State Management:**
- Real-time update khi status changes
- Disable form fields khi status = HOAN_THANH hoặc HUY
- Show appropriate action buttons based on status

**API Integration:**
- GET /api/medical-record/{id}
- PUT /api/medical-record (update fields)
- PUT /api/medical-record/status (status transitions)
- GET /api/html/medical-record/{id}
- GET /api/html/invoice/{medicalRecordId}

### 4.3 Medical Records List/Table
- ❌ **Status:** Chưa có
- **Priority:** P2
- **File:** `src/features/medical-records/components/medical-records-table.tsx`
- **Route:** `/medical-records`
- **Requirements:**
  - Similar to AppointmentsTable pattern
  - Columns:
    - code (PK{timestamp})
    - patientName
    - doctorName
    - date
    - status (badge)
    - total amount
    - paid amount
    - Actions: [Xem]
  - Filters:
    - Search by patient name, code
    - Filter by status
    - Filter by date range
  - Pagination (URL state)
  - API: GET /api/medical-records (cần thêm vào spec)

---

## 5. 💳 PAYMENTS MODULE

### 5.1 QR Payment Modal
- ❌ **Status:** Chưa có
- **Priority:** P1
- **File:** `src/features/payments/components/qr-payment-modal.tsx`
- **Requirements:**

**Display:**
- QR code image (large, centered)
- Order code (display prominently)
- Total amount (formatted currency)
- Countdown timer (5 phút)
  - Visual countdown (circular or linear progress)
  - Format: 04:35
- Polling indicator (small loading spinner)
- Instructions: "Quét mã QR để thanh toán"

**States:**
- DANG_CHO_THANH_TOAN (initial)
  - Show QR, countdown, polling
- DA_THANH_TOAN (success)
  - Show success message
  - Auto close modal (1-2s delay)
  - Trigger onSuccess callback
- THAT_BAI (error)
  - Show error message
  - Button [Thử lại] or [Đóng]
- TIMEOUT (5 phút elapsed)
  - Show timeout message
  - Button [Tạo link mới] or [Đóng]

**Polling Logic:**
- Start polling when modal opens
- Interval: 3-5 seconds
- API: GET /api/payments/status/{orderCode}
- Stop on:
  - success (status = DA_THANH_TOAN)
  - error (API returns error)
  - timeout (5 phút)
  - modal close

**Props:**
```tsx
interface QRPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  qrCode: string
  orderCode: number
  totalAmount: number
  onSuccess: (invoiceId: number) => void
  onError: (error: Error) => void
}
```

**API Integration:**
- GET /api/payments/status/{orderCode} (polling)
- Cache: 300s

**TODO Checklist:**
- [ ] Implement polling logic with useInterval hook
- [ ] Implement countdown timer
- [ ] Implement state machine (PaymentStateMachine)
- [ ] Add QRCodeDisplay component
- [ ] Handle all error cases
- [ ] Cleanup: stop polling on unmount

### 5.2 Payment Method Selector
- ❌ **Status:** Chưa có
- **Priority:** P0
- **File:** `src/features/payments/components/payment-method-selector.tsx`
- **Requirements:**
  - Radio group: Cash / QR
  - Visual cards/tiles for each option
  - Icons for each method
  - Props:
    ```tsx
    interface PaymentMethodSelectorProps {
      value: 'cash' | 'qr'
      onChange: (value: 'cash' | 'qr') => void
      disabled?: boolean
    }
    ```

---

## 6. 🧪 LAB ORDERS MODULE

### 6.1 Create Lab Order Modal/Drawer
- ❌ **Status:** Chưa có
- **Priority:** P1
- **File:** `src/features/lab-orders/components/create-lab-order-form.tsx`
- **Trigger:** Button trong Medical Record Detail Page
- **Requirements:**

**Form Fields:**
```tsx
{
  recordId: string              // Auto-filled from context
  healthPlanId: number          // SearchableSelect, required
  performingDoctorId: number    // SearchableSelect (available=true), required
  diagnosis: string             // Textarea, required, maxLength: 1000
}
```

**Components:**
- HealthPlan/Service SearchableSelect
  - API: GET /api/services?keyword={query}
  - Display: name, price, typeService
- Doctor SearchableSelect
  - API: GET /api/doctors?available=true
  - Display: fullName, position

**API Integration:**
- POST /api/lab-orders
- X-Idempotency-Key header

**Side Effect:**
- After successful creation, medical record status auto changes to CHO_XET_NGHIEM
- Close modal
- Refresh medical record detail page

**Error Handling:**
- NOT_FOUND_003: Medical record không tồn tại
- BIZ_003: Medical record đã hoàn thành/hủy

**Props:**
```tsx
interface CreateLabOrderFormProps {
  isOpen: boolean
  onClose: () => void
  medicalRecordId: string
  onSuccess: (labOrder: LabOrder) => void
}
```

### 6.2 Lab Orders List/Table
- ❌ **Status:** Chưa có
- **Priority:** P2
- **File:** `src/features/lab-orders/components/lab-orders-table.tsx`
- **Route:** `/lab-orders`
- **Requirements:**
  - Columns:
    - code (XN{timestamp})
    - patientName
    - serviceName
    - performingDoctor
    - status (badge)
    - diagnosis
    - createdAt
    - Actions (conditional)
  - Filters:
    - Search by patient name, code
    - Filter by status: CHO_THUC_HIEN, DANG_THUC_HIEN, HOAN_THANH, HUY_BO
    - Filter by date range
  - Pagination
  - API: GET /api/lab-orders (cần thêm vào spec)

**Actions by Status:**
- CHO_THUC_HIEN:
  - [Bắt đầu] → PUT /api/lab-orders/status (DANG_THUC_HIEN)
  - [Hủy] → PUT /api/lab-orders/status (HUY_BO)
- DANG_THUC_HIEN:
  - [Nhập kết quả] → Open LabResultForm modal
  - [Hủy] → PUT /api/lab-orders/status (HUY_BO)
- HOAN_THANH:
  - [Xem kết quả] → Open LabResultView modal
- HUY_BO:
  - No actions

### 6.3 Lab Result Form
- ❌ **Status:** Chưa có
- **Priority:** P2
- **File:** `src/features/lab-orders/components/lab-result-form.tsx`
- **Requirements:**

**Form Fields:**
```tsx
{
  labOrderId: number        // Auto-filled
  resultDetails: string     // Textarea, required
  note: string              // Textarea, optional
  explanation: string       // Textarea, optional
}
```

**API Integration:**
- POST /api/lab-results
- After success → PUT /api/lab-orders/status (HOAN_THANH)

**Props:**
```tsx
interface LabResultFormProps {
  isOpen: boolean
  onClose: () => void
  labOrder: LabOrder
  onSuccess: () => void
}
```

### 6.4 Lab Result View
- ❌ **Status:** Chưa có
- **Priority:** P3
- **File:** `src/features/lab-orders/components/lab-result-view.tsx`
- **Requirements:**
  - Display-only modal/drawer
  - Show: resultDetails, note, explanation
  - Lab order info: code, service, performing doctor
  - Created/completed dates

---

## 7. 💊 PRESCRIPTIONS MODULE

### 7.1 Create/Edit Prescription Drawer
- ❌ **Status:** Chưa có
- **Priority:** P1
- **File:** `src/features/prescriptions/components/prescription-form.tsx`
- **Trigger:** Button trong Medical Record Detail Page
- **Requirements:**

**Two-step Process:**

**Step 1: Create Prescription Container**
```tsx
{
  medicalRecordId: string     // Auto-filled
  generalInstructions: string // Textarea, optional
}
```
- Submit → POST /api/prescriptions
- Response: Prescription với code DT{timestamp}
- Move to Step 2

**Step 2: Add Medicines (Dynamic List)**
```tsx
{
  prescriptionId: number      // From Step 1
  medicines: Array<{
    medicineId: number        // SearchableSelect, required
    quantity: number          // Input number, required, min: 1
    usageInstructions: string // Textarea, required
  }>
}
```

**Components:**
- Medicine SearchableSelect
  - API: GET /api/medicines?keyword={query}
  - Display: name, unit, price
- Dynamic list with [Thêm thuốc] button
- Each medicine row:
  - Medicine select
  - Quantity input
  - Usage instructions textarea
  - [Sửa] button → PUT /api/prescriptions/details
  - [Xóa] button → DELETE /api/prescriptions/details/{id}

**Footer:**
- Total medicines count
- [Hoàn thành] button → Close drawer
- [Cập nhật hướng dẫn chung] → PUT /api/prescriptions

**API Integration:**
- POST /api/prescriptions (Step 1)
- GET /api/medicines?keyword={query}
- POST /api/prescriptions/details (add medicine)
- PUT /api/prescriptions/details (update medicine)
- DELETE /api/prescriptions/details/{id} (remove medicine)
- PUT /api/prescriptions (update general instructions)

**Error Handling:**
- NOT_FOUND_003: Medical record không tồn tại
- BIZ_005: Medical record không ở trạng thái DANG_KHAM

**Props:**
```tsx
interface PrescriptionFormProps {
  isOpen: boolean
  onClose: () => void
  medicalRecordId: string
  existingPrescription?: Prescription // For edit mode
  onSuccess: () => void
}
```

### 7.2 Prescriptions List (in Medical Record)
- ❌ **Status:** Chưa có
- **Priority:** P2
- **File:** `src/features/prescriptions/components/prescriptions-list.tsx`
- **Used In:** Medical Record Detail Page
- **Requirements:**
  - Display list of prescriptions
  - Each prescription:
    - code (DT{timestamp})
    - generalInstructions
    - createdAt
    - Expandable: danh sách thuốc
  - Expandable medicine details:
    - medicine name
    - quantity + unit
    - usageInstructions
  - If editable (status=DANG_KHAM):
    - [Sửa] button → Open PrescriptionForm in edit mode

---

## 8. ✅ VALIDATION & FORMS

### 8.1 Zod Schemas
- ❌ **Status:** Chưa có
- **Priority:** P0
- **Files:** `src/lib/validations/*.ts`

**Schemas cần tạo:**

#### patient.schema.ts
```tsx
import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
  .nullable()
  .optional()

export const cccdSchema = z
  .string()
  .regex(/^\d{9,12}$/, 'Số CCCD phải từ 9-12 chữ số')

export const createPatientSchema = z.object({
  phone: phoneSchema,
  email: z.string().email('Email không hợp lệ').nullable().optional(),
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  address: z.string().min(1, 'Địa chỉ là bắt buộc').max(255),
  cccd: cccdSchema,
  birth: z.string().refine(
    (date) => new Date(date) <= new Date(),
    'Ngày sinh không thể trong tương lai'
  ),
  gender: z.enum(['NAM', 'NU'], {
    errorMap: () => ({ message: 'Giới tính không hợp lệ' }),
  }),
  bloodType: z.enum(['A', 'B', 'AB', 'O'], {
    errorMap: () => ({ message: 'Nhóm máu không hợp lệ' }),
  }),
  weight: z.number().min(0).max(500, 'Cân nặng không hợp lệ'),
  height: z.number().min(0).max(300, 'Chiều cao không hợp lệ'),
  profileImage: z.string().url().nullable().optional(),
  phoneLink: phoneSchema,
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
```

#### appointment.schema.ts
```tsx
import { z } from 'zod'

export const createAppointmentSchema = z.object({
  patientId: z.number().min(1),
  doctorId: z.number().min(1),
  departmentId: z.number().min(1),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  symptoms: z.string().max(1000).optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => {
    const datetime = new Date(`${data.appointmentDate}T${data.appointmentTime}`)
    return datetime > new Date()
  },
  {
    message: 'Thời gian khám phải trong tương lai',
    path: ['appointmentTime'],
  }
)
```

#### medical-record.schema.ts
```tsx
import { z } from 'zod'

export const createMedicalRecordSchema = z.object({
  patientId: z.number().min(1),
  doctorId: z.number().nullable().optional(),
  healthPlanId: z.number().nullable().optional(),
  symptoms: z.string().min(1).max(2000),
  invoiceId: z.number().nullable().optional(),
})

export const updateMedicalRecordSchema = z.object({
  clinicalExamination: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  note: z.string().optional(),
})
```

#### lab-order.schema.ts
```tsx
import { z } from 'zod'

export const createLabOrderSchema = z.object({
  recordId: z.string(),
  healthPlanId: z.number().min(1),
  performingDoctorId: z.number().min(1),
  diagnosis: z.string().min(1).max(1000),
})

export const labResultSchema = z.object({
  labOrderId: z.number().min(1),
  resultDetails: z.string().min(1),
  note: z.string().optional(),
  explanation: z.string().optional(),
})
```

#### prescription.schema.ts
```tsx
import { z } from 'zod'

export const createPrescriptionSchema = z.object({
  medicalRecordId: z.string(),
  generalInstructions: z.string().optional(),
})

export const prescriptionDetailSchema = z.object({
  prescriptionId: z.number().min(1),
  medicineId: z.number().min(1),
  quantity: z.number().min(1),
  usageInstructions: z.string().min(1),
})
```

### 8.2 Form Utilities
- ❌ **Status:** Chưa có
- **File:** `src/lib/form-utils.ts`
- **Requirements:**
  - Date formatters (YYYY-MM-DD ↔ display format)
  - Time formatters (HH:mm validation)
  - Phone formatters (0912345678 ↔ 091 234 5678)
  - CCCD formatters
  - Currency formatters
  - Error message mappers (API errors → user-friendly)

---

## 9. 📦 STATE MANAGEMENT

### 9.1 State Machines
- ❌ **Status:** Chưa có
- **Priority:** P1
- **Files:** `src/lib/state-machines/*.ts`

**Machines cần tạo:**

#### appointment-state-machine.ts
```tsx
type AppointmentStatus = 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'DA_DEN' | 'KHONG_DEN'

type AppointmentEvent = 'confirm' | 'mark_arrived' | 'mark_no_show'

interface AppointmentContext {
  role: UserRole
  appointmentId: number
}

// Implementation với XState hoặc custom logic
```

#### medical-record-state-machine.ts
```tsx
type MedicalRecordStatus = 'DANG_KHAM' | 'CHO_XET_NGHIEM' | 'HOAN_THANH' | 'HUY'

type MedicalRecordEvent = 'add_lab_order' | 'complete_examination' | 'cancel'

interface MedicalRecordContext {
  role: UserRole
  recordId: string
  diagnosis: string | null
}
```

#### lab-order-state-machine.ts
```tsx
type LabOrderStatus = 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY_BO'

type LabOrderEvent = 'start_execution' | 'enter_result' | 'cancel'

interface LabOrderContext {
  role: UserRole
  labOrderId: number
  statusPayment: string
}
```

#### payment-state-machine.ts
```tsx
type PaymentStatus =
  | 'CHUA_THANH_TOAN'
  | 'DANG_CHO_THANH_TOAN'
  | 'DA_THANH_TOAN'
  | 'THAT_BAI'
  | 'TIMEOUT'

type PaymentEvent =
  | 'create_qr'
  | 'payment_success'
  | 'payment_fail'
  | 'payment_timeout'
  | 'cash_payment'

interface PaymentContext {
  method: 'cash' | 'qr'
  orderCode?: number
  invoiceId?: number
}
```

### 9.2 React Query Hooks
- ❌ **Status:** Chưa có (có một phần trong appointments)
- **Priority:** P0
- **Files:** `src/features/*/hooks/*.ts`

**Hooks cần tạo cho mỗi module:**

**Patients:**
- usePatients() - GET /api/patients
- useCreatePatient() - POST /api/patients
- useUpdatePatient() - PUT /api/patients/{id}
- usePatient() - GET /api/patients/{id}

**Appointments:**
- useAppointments() - GET /api/appointments (✅ có rồi)
- useCreateAppointment() - POST /api/appointments
- useConfirmAppointment() - PUT /api/appointments/confirm (✅ có rồi)

**Medical Records:**
- useMedicalRecord() - GET /api/medical-record/{id}
- useCreateMedicalRecord() - POST /api/medical-record
- useUpdateMedicalRecord() - PUT /api/medical-record
- useUpdateMedicalRecordStatus() - PUT /api/medical-record/status
- usePatientMedicalHistory() - GET /api/medical-record/patient/{id}

**Payments:**
- useCreatePaymentLink() - POST /api/payments/create-link
- usePaymentStatus() - GET /api/payments/status/{orderCode}

**Lab Orders:**
- useLabOrders() - GET /api/lab-orders
- useCreateLabOrder() - POST /api/lab-orders
- useUpdateLabOrderStatus() - PUT /api/lab-orders/status
- useCreateLabResult() - POST /api/lab-results

**Prescriptions:**
- useCreatePrescription() - POST /api/prescriptions
- useMedicines() - GET /api/medicines
- useAddPrescriptionDetail() - POST /api/prescriptions/details
- useUpdatePrescriptionDetail() - PUT /api/prescriptions/details
- useDeletePrescriptionDetail() - DELETE /api/prescriptions/details/{id}

**Supporting:**
- useDepartments() - GET /api/departments
- useDoctors() - GET /api/doctors
- useHealthPlans() - GET /api/services

---

## 📊 IMPLEMENTATION SUMMARY

### By Priority

#### P0 - Critical Components (Must have for MVP)
**Total: 15 components**

1. ✅ Shared:
   - [ ] TimePicker
   - [ ] PhoneInput
   - [ ] SearchableSelect

2. ✅ Patients:
   - [ ] PatientSearch
   - [ ] PatientForm (create mode)

3. ✅ Appointments:
   - [ ] CreateAppointmentForm (complete implementation)

4. ✅ Medical Records:
   - [ ] CreateMedicalRecordForm (cash flow)
   - [ ] MedicalRecordDetailPage (basic)

5. ✅ Payments:
   - [ ] PaymentMethodSelector

6. ✅ Validation:
   - [ ] All Zod schemas (patient, appointment, medical-record)

7. ✅ State Management:
   - [ ] React Query hooks (patients, appointments, medical-records)

8. ✅ Supporting:
   - [ ] Departments/Doctors SearchableSelect

#### P1 - High Priority (Launch soon after)
**Total: 12 components**

1. ✅ Shared:
   - [ ] CCCDInput
   - [ ] StatusBadge
   - [ ] QRCodeDisplay

2. ✅ Medical Records:
   - [ ] MedicalRecordDetailPage (complete with all actions)

3. ✅ Payments:
   - [ ] QRPaymentModal (full flow with polling)

4. ✅ Lab Orders:
   - [ ] CreateLabOrderForm

5. ✅ Prescriptions:
   - [ ] PrescriptionForm (full flow)

6. ✅ Validation:
   - [ ] All Zod schemas (lab-order, prescription)

7. ✅ State Management:
   - [ ] State machines (all 4)
   - [ ] React Query hooks (payments, lab-orders, prescriptions)

#### P2 - Medium Priority
**Total: 10 components**

1. ✅ Shared:
   - [ ] PatientCard
   - [ ] DataTableDateFilter

2. ✅ Patients:
   - [ ] PatientsTable
   - [ ] PatientDetailPage
   - [ ] PatientForm (edit mode)

3. ✅ Medical Records:
   - [ ] MedicalRecordsTable

4. ✅ Lab Orders:
   - [ ] LabOrdersTable
   - [ ] LabResultForm

5. ✅ Prescriptions:
   - [ ] PrescriptionsList

#### P3 - Low Priority
**Total: 3 components**

1. ✅ Appointments:
   - [ ] SimpleAppointmentForm (review/remove)
   - [ ] AppointmentFilters (review)

2. ✅ Lab Orders:
   - [ ] LabResultView

---

## 🎯 SPRINT PLANNING

### Sprint 1 (Week 1-2): P0 Foundation
**Goal:** Core patient & medical record creation flows

**Day 1-2:**
- [ ] TimePicker component
- [ ] PhoneInput component
- [ ] All Zod schemas (patient, appointment, medical-record)

**Day 3-4:**
- [ ] SearchableSelect component
- [ ] PatientSearch component
- [ ] PatientForm (create mode)

**Day 5-7:**
- [ ] Complete CreateAppointmentForm
- [ ] Departments/Doctors API integration
- [ ] React Query hooks (patients, departments, doctors)

**Day 8-10:**
- [ ] CreateMedicalRecordForm (cash flow only)
- [ ] MedicalRecordDetailPage (basic view + update)
- [ ] PaymentMethodSelector
- [ ] React Query hooks (medical-records)

### Sprint 2 (Week 3-4): P1 Advanced Features
**Goal:** QR payment, prescriptions, lab orders, state machines

**Day 1-3:**
- [ ] QRPaymentModal (full implementation)
- [ ] Payment polling logic
- [ ] PaymentStateMachine
- [ ] React Query hooks (payments)
- [ ] Integrate QR flow into CreateMedicalRecordForm

**Day 4-6:**
- [ ] PrescriptionForm (full flow)
- [ ] Medicine SearchableSelect
- [ ] React Query hooks (prescriptions, medicines)
- [ ] Integrate into MedicalRecordDetailPage

**Day 7-9:**
- [ ] CreateLabOrderForm
- [ ] HealthPlan SearchableSelect
- [ ] React Query hooks (lab-orders, health-plans)
- [ ] Integrate into MedicalRecordDetailPage

**Day 10:**
- [ ] Complete MedicalRecordDetailPage (all actions)
- [ ] Implement all state machines
- [ ] Status transitions and guards

### Sprint 3 (Week 5-6): P2 Management & Polish
**Goal:** List views, patient management, lab order management

**Day 1-3:**
- [ ] PatientsTable
- [ ] PatientDetailPage (with history)
- [ ] PatientForm (edit mode)
- [ ] React Query hooks (patient history)

**Day 4-6:**
- [ ] MedicalRecordsTable
- [ ] LabOrdersTable
- [ ] LabResultForm
- [ ] PrescriptionsList

**Day 7-10:**
- [ ] Shared components polish (PatientCard, StatusBadge, etc.)
- [ ] DataTableDateFilter
- [ ] Bug fixes & UX improvements
- [ ] Testing & QA

---

## 📝 NOTES

### Component Standards
- All forms use react-hook-form + Zod validation
- All API calls use React Query hooks
- All tables follow AppointmentsTable pattern (URL state, pagination, filters)
- All modals/drawers use Dialog/Sheet from shadcn/ui
- All loading states use Skeleton components
- All errors show toast notifications

### File Structure
```
src/features/{module}/
├── api/
│   └── {module}.ts           # API functions
├── components/
│   ├── {module}-table.tsx    # List/table view
│   ├── {module}-form.tsx     # Create/edit form
│   ├── {module}-detail.tsx   # Detail view
│   └── {module}-*.tsx        # Other components
├── hooks/
│   └── use-{module}.ts       # React Query hooks
├── types.ts                  # TypeScript types
├── constants.ts              # Constants, labels, options
└── index.tsx                 # Main page component
```

### Testing Strategy
- Unit tests for validation schemas
- Unit tests for API functions
- Integration tests for forms
- E2E tests for critical flows (UC001-UC010)

---

**Total Components to Build: ~40**
**Estimated Time: 6 weeks (with 3-4 developers)**
**MVP Target: End of Week 2 (P0 components)**
