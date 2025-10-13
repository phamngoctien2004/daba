# IMPLEMENTATION STATUS - Hệ thống Quản lý Phòng khám

**Ngày cập nhật:** 2025-10-13
**Tài liệu tham chiếu:** BUSINESS_LOGIC_SPEC.json

---

## 📊 TỔNG QUAN TIẾN ĐỘ

| Module | API Integration | Frontend UI | State Management | Validation | Status |
|--------|----------------|-------------|------------------|------------|--------|
| **Authentication** | ✅ Hoàn thành | ✅ Hoàn thành | ✅ Hoàn thành | ✅ Hoàn thành | 🟢 DONE |
| **Appointments (UC001, UC003)** | ✅ Hoàn thành | ✅ Hoàn thành | ✅ Hoàn thành | ⚠️ Một phần | 🟡 80% |
| **Patients (UC002, UC009)** | ⚠️ Folder có | ❌ Chưa có | ❌ Chưa có | ❌ Chưa có | 🔴 10% |
| **Medical Records (UC004, UC005, UC010)** | ⚠️ Folder có | ❌ Chưa có | ❌ Chưa có | ❌ Chưa có | 🔴 10% |
| **Payments (UC004)** | ⚠️ Folder có | ❌ Chưa có | ❌ Chưa có | ❌ Chưa có | 🔴 10% |
| **Lab Orders (UC006, UC008)** | ⚠️ Folder có | ❌ Chưa có | ❌ Chưa có | ❌ Chưa có | 🔴 10% |
| **Prescriptions (UC007)** | ⚠️ Folder có | ❌ Chưa có | ❌ Chưa có | ❌ Chưa có | 🔴 10% |

**Chú thích:**
- 🟢 DONE: Hoàn thành đầy đủ
- 🟡 IN PROGRESS: Đang phát triển
- 🔴 NOT STARTED: Chưa bắt đầu hoặc chỉ có cấu trúc folder

---

## 1. 🔐 AUTHENTICATION & AUTHORIZATION

### ✅ Đã hoàn thành

#### API Integration
- ✅ **POST /api/auth/dashboard/login**
  - File: `src/lib/api/auth.api.ts`
  - Types: `src/types/auth.ts` (LoginRequest, LoginResponse)
  - Xử lý login, nhận accessToken và userResponse

#### State Management
- ✅ **Zustand Store**
  - File: `src/stores/auth-store.ts`
  - Features:
    - login(user, accessToken)
    - logout()
    - setUser(user)
    - setAccessToken(token)
    - Persistent state qua localStorage

- ✅ **Auth Storage**
  - File: `src/lib/auth-storage.ts`
  - Functions: getAuthToken(), setAuthToken(), removeAuthToken(), getUserData(), setUserData(), clearAuthData()

#### API Client
- ✅ **Axios Instance với Interceptors**
  - File: `src/lib/api-client.ts`
  - Features:
    - Auto attach JWT Bearer token
    - Error handling với toast notifications
    - 401 → redirect to /sign-in
    - 403, 404, 422, 500 error handling

#### Types & Enums
- ✅ UserRole: ADMIN, LE_TAN, BAC_SI
- ✅ Gender: NAM, NU
- ✅ User, Doctor, LoginRequest, LoginResponse interfaces

#### UI Components
- ✅ Sign-in form (`src/features/auth/sign-in/components/user-auth-form.tsx`)
- ✅ Auth layout
- ✅ Route protection (`src/routes/_authenticated/route.tsx`)

### ❌ Chưa có
- ❌ Forgot password flow (có folder nhưng chưa integrate API)
- ❌ OTP verification (có folder nhưng chưa integrate API)
- ❌ Sign-up flow (có folder nhưng chưa integrate API)

---

## 2. 📅 APPOINTMENTS MODULE (UC001, UC003)

### ✅ Đã hoàn thành (80%)

#### API Integration
- ✅ **GET /api/appointments**
  - File: `src/features/appointments/api/appointments.ts`
  - Function: `fetchAppointments(params: AppointmentListParams)`
  - Params: phone, date, status, page, pageSize
  - Response: AppointmentListResult { appointments, pagination, message }
  - Hỗ trợ flexible pagination parsing

- ✅ **PUT /api/appointments/confirm**
  - Function: `confirmAppointment(payload: ConfirmAppointmentPayload)`
  - Payload: { id, status }
  - Xử lý state transitions: CHO_XAC_NHAN → DA_XAC_NHAN → DA_DEN, KHONG_DEN

#### Types & Constants
- ✅ AppointmentStatus: CHO_XAC_NHAN, DA_XAC_NHAN, DA_DEN, KHONG_DEN
- ✅ Appointment interface (đầy đủ fields)
- ✅ STATUS_LABELS, STATUS_FILTER_OPTIONS
- ✅ getStatusBadgeVariant() helper

#### Frontend UI
- ✅ **AppointmentsTable Component**
  - File: `src/features/appointments/components/appointments-table.tsx`
  - Features:
    - Danh sách appointments với pagination
    - Search theo phone
    - Filter theo status
    - Filter theo date (DatePicker)
    - Reset filters button
    - Loading states (skeleton, refetching indicator)
    - URL state synchronization

- ✅ **Appointments Columns**
  - File: `src/features/appointments/components/appointments-columns.tsx`
  - Columns:
    - Bệnh nhân (fullName, birth)
    - Liên hệ (phone, email)
    - Lịch hẹn (date, time, createdAt)
    - Bác sĩ (doctorResponse)
    - Khoa (departmentResponse)
    - Trạng thái (Badge với color variants)
    - Actions (conditional buttons dựa trên status)

  - **Actions theo State Machine:**
    - CHO_XAC_NHAN: [Xác nhận] [Hủy]
    - DA_XAC_NHAN: [Đã đến] [Hủy]
    - DA_DEN: [Tạo phiếu khám]
    - Loading states cho từng action

- ✅ **Routes**
  - `/appointments` - Danh sách appointments
  - `/appointments/create-medical-record/$appointmentId` - Tạo phiếu khám từ appointment

#### State Management
- ✅ URL state sync với useTableUrlState hook
- ✅ Pagination state
- ✅ Filter states (phone, date, status)

### ⚠️ Còn thiếu (20%)

#### API Integration
- ❌ **POST /api/appointments** - Tạo appointment mới
  - Chưa có API function
  - Cần AppointmentCreateData payload
  - Cần validation: date/time trong tương lai, doctor available
  - Cần X-Idempotency-Key header

#### Frontend UI
- ⚠️ **Create Appointment Form**
  - File có: `src/features/appointments/components/create-appointment-form.tsx`
  - Cần kiểm tra xem đã implement đầy đủ chưa
  - Required fields:
    - Search/select patient (hoặc button "Tạo bệnh nhân mới")
    - Select department (departmentId)
    - Select doctor theo department (doctorId)
    - DatePicker (appointmentDate: YYYY-MM-DD)
    - TimePicker (appointmentTime: HH:mm)
    - Textarea symptoms (maxLength: 1000)
    - Textarea notes (maxLength: 500)

- ❌ **Simple Appointment Form**
  - File có: `src/features/appointments/components/simple-appointment-form.tsx`
  - Chưa rõ mục đích sử dụng

- ❌ **Appointment Filters Component**
  - File có: `src/features/appointments/components/appointment-filters.tsx`
  - Có thể đã tích hợp vào AppointmentsTable

#### Validation
- ❌ Client-side validation cho Create Appointment Form
  - appointmentDate + appointmentTime > now
  - Doctor available at selected time
  - Required fields validation

#### State Machine
- ⚠️ AppointmentStateMachine implementation
  - Logic transitions đã có trong columns (action buttons)
  - Nhưng chưa có formal state machine validator
  - Chưa có effects: save to localStorage khi DA_DEN

---

## 3. 👤 PATIENTS MODULE (UC002, UC009)

### ⚠️ Cấu trúc hiện tại
```
src/features/patients/
└── api/
    └── (chưa có file)
```

### ❌ Chưa có (90%)

#### API Integration - Cần implement
- ❌ **POST /api/patients** - Tạo bệnh nhân mới (UC002)
  - NewPatientCreateData payload:
    - phone (optional, pattern: ^0\d{9}$)
    - email (optional, format: email)
    - fullName (required, maxLength: 100)
    - address (required, maxLength: 255)
    - cccd (required, pattern: ^\d{9,12}$, unique)
    - birth (required, date <= today)
    - gender (required, enum: NAM, NU)
    - bloodType (required, enum: A, B, AB, O)
    - weight (required, 0-500)
    - height (required, 0-300)
    - profileImage (optional)
    - phoneLink (optional)
  - Response: Patient với code BN{timestamp}
  - X-Idempotency-Key header

- ❌ **GET /api/patients** - Search bệnh nhân
  - Query params: phone, keyword
  - Dùng cho appointment creation flow

- ❌ **GET /api/patients/{id}** - Chi tiết bệnh nhân

- ❌ **PUT /api/patients/{id}** - Cập nhật thông tin bệnh nhân

- ❌ **GET /api/medical-record/patient/{patientId}** - Lịch sử khám (UC009)
  - Response: Danh sách medical records
  - Sort theo thời gian giảm dần
  - Highlight status=DANG_KHAM
  - Cache: 60s

#### Frontend UI - Cần implement
- ❌ **Patients List/Table**
  - Search theo phone, CCCD, tên
  - Pagination
  - Columns: code, fullName, phone, cccd, gender, birth, bloodType

- ❌ **Create Patient Form (UC002)**
  - Form fields đầy đủ theo spec
  - Validation rules
  - Handle 409 (CCCD đã tồn tại)
  - Gợi ý khi phone đã tồn tại

- ❌ **Patient Detail Page**
  - Thông tin cá nhân
  - Lịch sử khám bệnh (UC009)
  - Tab/section cho từng medical record

- ❌ **Patient Search Component**
  - Dùng trong Create Appointment flow
  - Autocomplete/typeahead
  - Button "Tạo bệnh nhân mới"

#### Types & Validation
- ❌ Patient interface
- ❌ NewPatientCreateData type
- ❌ Validation schemas (Zod)
- ❌ Field-level validators (phone, cccd, email, birth, gender, bloodType, weight, height)

---

## 4. 🏥 MEDICAL RECORDS MODULE (UC004, UC005, UC010)

### ⚠️ Cấu trúc hiện tại
```
src/features/medical-records/
└── api/
    └── (chưa có file)
```

### ❌ Chưa có (90%)

#### API Integration - Cần implement

##### UC004: Tạo phiếu khám và thanh toán
- ❌ **POST /api/medical-record**
  - SimpleMedicalRecordCreateData payload:
    - patientId (required)
    - doctorId (optional)
    - healthPlanId (optional)
    - symptoms (required, maxLength: 2000)
    - invoiceId (optional - null cho cash, có giá trị khi QR payment success)
  - Response: Medical record với code PK{timestamp}, status=DANG_KHAM
  - X-Idempotency-Key header

##### UC005: Bác sĩ khám bệnh
- ❌ **GET /api/medical-record/{id}** - Chi tiết phiếu khám
  - Response: MedicalRecordDetailResponse (full structure với invoice details)

- ❌ **PUT /api/medical-record** - Cập nhật phiếu khám (lưu tạm)
  - Fields: clinicalExamination, diagnosis, treatmentPlan, note

- ❌ **PUT /api/medical-record/status** - Cập nhật trạng thái
  - Transitions: DANG_KHAM → CHO_XET_NGHIEM → HOAN_THANH
  - Transitions: DANG_KHAM/CHO_XET_NGHIEM → HUY
  - Guard: role=BAC_SI, diagnosis not null (cho HOAN_THANH)

##### UC010: In phiếu khám
- ❌ **GET /api/html/medical-record/{id}** - HTML phiếu khám
- ❌ **GET /api/html/invoice/{medicalRecordId}** - HTML hóa đơn

#### Frontend UI - Cần implement

##### UC004: Form tạo phiếu khám (từ appointment)
- ❌ **Create Medical Record Form**
  - Route: `/appointments/create-medical-record/$appointmentId`
  - File có: `src/routes/_authenticated/appointments/create-medical-record/$appointmentId.tsx`
  - Cần implement:
    - Auto-fill patient info từ appointment
    - Select health plan (healthPlanId)
    - Textarea symptoms (từ appointment hoặc nhập mới)
    - Hiển thị phí khám (calculated from healthPlan/doctor)
    - Payment method selection: [Cash] [QR]
    - Cash flow: POST /api/medical-record ngay
    - QR flow: Xem section Payments

##### UC005: Bác sĩ khám bệnh
- ❌ **Medical Record Detail Page**
  - Hiển thị thông tin patient
  - Hiển thị symptoms
  - Form fields:
    - Textarea clinicalExamination
    - Textarea diagnosis
    - Textarea treatmentPlan
    - Textarea note
  - Buttons:
    - [Lưu tạm] - PUT /api/medical-record
    - [Chỉ định xét nghiệm] - Modal/drawer
    - [Kê đơn thuốc] - Modal/drawer
    - [Hoàn thành] - status → HOAN_THANH
    - [Hủy] - status → HUY
  - Danh sách lab orders (nếu có)
  - Danh sách prescriptions (nếu có)
  - Guard: Chỉ cho phép update khi status=DANG_KHAM hoặc CHO_XET_NGHIEM

##### UC010: In phiếu khám/hóa đơn
- ❌ **Print Medical Record Button**
  - GET /api/html/medical-record/{id}
  - Open HTML in new window → window.print()

- ❌ **Print Invoice Button**
  - GET /api/html/invoice/{medicalRecordId}
  - Open HTML in new window → window.print()

#### Types & State Machine
- ❌ MedicalRecordStatus: DANG_KHAM, CHO_XET_NGHIEM, HOAN_THANH, HUY
- ❌ MedicalRecord interface
- ❌ SimpleMedicalRecordCreateData type
- ❌ MedicalRecordDetailResponse type
- ❌ MedicalRecordStateMachine implementation
  - Auto transition DANG_KHAM → CHO_XET_NGHIEM khi tạo lab order
  - Guards cho transitions
  - Effects

---

## 5. 💳 PAYMENTS MODULE (UC004 - QR Payment Flow)

### ⚠️ Cấu trúc hiện tại
```
src/features/payments/
└── api/
    └── (chưa có file)
```

### ❌ Chưa có (90%)

#### API Integration - Cần implement
- ❌ **POST /api/payments/create-link**
  - PaymentLinkRequest payload:
    - medicalRecordId (optional)
    - labOrderIds (optional array)
    - healthPlanIds (optional array)
    - doctorId (optional)
    - totalAmount (required, > 0)
  - Response: PaymentLinkResponse { invoiceId, qrCode, orderCode }

- ❌ **GET /api/payments/status/{orderCode}** - Polling payment status
  - Response: { success: boolean, ... }
  - Polling strategy: mỗi 3-5s
  - Max duration: 5 phút
  - Cache: 300s (5 phút)

#### Frontend UI - Cần implement
- ❌ **QR Payment Modal**
  - Display QR code image
  - Countdown timer (5 phút)
  - Polling payment status (3-5s interval)
  - Status indicators:
    - DANG_CHO_THANH_TOAN - Đang chờ, hiển thị QR
    - DA_THANH_TOAN - Success, tạo medical record, close modal
    - THAT_BAI - Error message
    - TIMEOUT - Timeout message sau 5 phút
  - Buttons: [Hủy]

- ❌ **Payment Method Selection**
  - Radio group: Cash / QR
  - Hiển thị trong Create Medical Record Form

#### State Machine
- ❌ PaymentStateMachine implementation
  - States: CHUA_THANH_TOAN → DANG_CHO_THANH_TOAN → DA_THANH_TOAN
  - States: DANG_CHO_THANH_TOAN → THAT_BAI / TIMEOUT
  - Effects:
    - create_qr: start polling, start countdown
    - payment_success: stop polling, POST /api/medical-record với invoiceId
    - payment_fail/timeout: stop polling, show message

#### Types
- ❌ PaymentLinkRequest
- ❌ PaymentLinkResponse
- ❌ PaymentStatus enum

---

## 6. 🧪 LAB ORDERS MODULE (UC006, UC008)

### ⚠️ Cấu trúc hiện tại
```
src/features/lab-orders/
└── api/
    └── (chưa có file)
```

### ❌ Chưa có (90%)

#### API Integration - Cần implement

##### UC006: Thêm chỉ định xét nghiệm
- ❌ **POST /api/lab-orders**
  - CreateLabOrderRequest payload:
    - recordId (required)
    - healthPlanId (required)
    - performingDoctorId (required, available=true)
    - diagnosis (required, maxLength: 1000)
  - Response: Lab order với code XN{timestamp}, status=CHO_THUC_HIEN
  - Auto chuyển medical record status → CHO_XET_NGHIEM

- ❌ **GET /api/health-plans** - Danh sách dịch vụ/xét nghiệm
  - Query param: keyword (search)

- ❌ **GET /api/doctors** - Danh sách bác sĩ
  - Filter: available=true

##### UC008: Thực hiện xét nghiệm
- ❌ **PUT /api/lab-orders/status** - Cập nhật trạng thái
  - Transitions: CHO_THUC_HIEN → DANG_THUC_HIEN → HOAN_THANH
  - Transitions: CHO_THUC_HIEN/DANG_THUC_HIEN → HUY_BO
  - Guard: statusPayment=DA_THANH_TOAN

- ❌ **POST /api/lab-results** - Nhập kết quả
  - Fields: labOrderId, resultDetails, note, explanation
  - Auto chuyển lab order status → HOAN_THANH

- ❌ **PUT /api/lab-results** - Cập nhật kết quả
  - Chỉ khi lab order status=DANG_THUC_HIEN

- ❌ **DELETE /api/lab-orders** (batch)
  - Xóa nhiều lab orders cùng lúc
  - Chỉ khi status=CHO_THUC_HIEN

#### Frontend UI - Cần implement

##### UC006: Modal/Drawer thêm chỉ định XN
- ❌ **Create Lab Order Form**
  - Trigger: Button trong Medical Record Detail Page
  - Search dịch vụ (healthPlan) theo keyword
  - Select performing doctor (available=true)
  - Textarea diagnosis (maxLength: 1000)
  - Submit → POST /api/lab-orders
  - Guard: medical record status=DANG_KHAM

##### UC008: Lab Orders Management
- ❌ **Lab Orders List/Table**
  - Filter theo status: CHO_THUC_HIEN, DANG_THUC_HIEN, HOAN_THANH, HUY_BO
  - Columns: code, patient, service, performing doctor, status, created date
  - Actions theo status:
    - CHO_THUC_HIEN: [Bắt đầu] [Hủy]
    - DANG_THUC_HIEN: [Nhập kết quả] [Hủy]
    - HOAN_THANH: [Xem kết quả]

- ❌ **Lab Result Form**
  - Textarea resultDetails
  - Textarea note
  - Textarea explanation
  - Submit → POST /api/lab-results → PUT /api/lab-orders/status (HOAN_THANH)

#### Types & State Machine
- ❌ LabOrderStatus: CHO_THUC_HIEN, DANG_THUC_HIEN, HOAN_THANH, HUY_BO
- ❌ LabOrder interface
- ❌ CreateLabOrderRequest type
- ❌ LabResult interface
- ❌ LabOrderStateMachine implementation

---

## 7. 💊 PRESCRIPTIONS MODULE (UC007)

### ⚠️ Cấu trúc hiện tại
```
src/features/prescriptions/
└── api/
    └── (chưa có file)
```

### ❌ Chưa có (90%)

#### API Integration - Cần implement
- ❌ **POST /api/prescriptions** - Tạo đơn thuốc container
  - Payload: { medicalRecordId, generalInstructions }
  - Response: Prescription với code DT{timestamp}
  - Guard: medical record status=DANG_KHAM

- ❌ **GET /api/medicines** - Danh sách thuốc
  - Query param: keyword (search)

- ❌ **POST /api/prescriptions/details** - Thêm thuốc vào đơn
  - Payload: { prescriptionId, medicineId, quantity, usageInstructions }

- ❌ **PUT /api/prescriptions/details** - Cập nhật chi tiết thuốc

- ❌ **DELETE /api/prescriptions/details/{id}** - Xóa thuốc khỏi đơn

- ❌ **PUT /api/prescriptions** - Cập nhật generalInstructions

#### Frontend UI - Cần implement
- ❌ **Create/Edit Prescription Modal/Drawer**
  - Trigger: Button trong Medical Record Detail Page
  - Step 1: Tạo prescription container
    - Textarea generalInstructions
    - Submit → POST /api/prescriptions
  - Step 2: Thêm thuốc (dynamic list)
    - Search medicine theo keyword
    - Input quantity (số lượng)
    - Textarea usageInstructions
    - [Thêm thuốc] → POST /api/prescriptions/details
    - [Sửa] → PUT /api/prescriptions/details
    - [Xóa] → DELETE /api/prescriptions/details/{id}
  - Guard: medical record status=DANG_KHAM

- ❌ **Prescriptions List** (trong Medical Record Detail)
  - Hiển thị code, general instructions
  - Expandable: danh sách thuốc với quantity, usage

#### Types
- ❌ Prescription interface
- ❌ PrescriptionDetail interface
- ❌ Medicine interface
- ❌ CreatePrescriptionRequest type

---

## 8. 🛠️ SHARED INFRASTRUCTURE

### ✅ Đã có

#### API Client
- ✅ Axios instance với interceptors
- ✅ Auto JWT token attachment
- ✅ Error handling với toast notifications
- ✅ Generic HTTP methods: get, post, put, patch, del

#### UI Components (shadcn/ui)
- ✅ Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- ✅ Button, Badge, Input, Textarea
- ✅ Dialog, AlertDialog, Sheet (modal/drawer)
- ✅ Select, Radio, Checkbox
- ✅ Calendar, DatePicker
- ✅ Skeleton (loading states)
- ✅ Toast/Sonner notifications
- ✅ Form (react-hook-form integration)

#### Data Table Components
- ✅ DataTablePagination
- ✅ DataTableToolbar
- ✅ DataTableFacetedFilter
- ✅ DataTableColumnHeader

#### Hooks
- ✅ useTableUrlState - URL state synchronization for tables

### ❌ Chưa có

#### Shared Components cần tạo
- ❌ **TimePicker Component**
  - Format: HH:mm
  - Validation

- ❌ **PhoneInput Component**
  - Pattern validation: ^0\d{9}$
  - Format display

- ❌ **CCCDInput Component**
  - Pattern validation: ^\d{9,12}$
  - Unique check indicator

- ❌ **SearchableSelect Component**
  - Typeahead/autocomplete
  - Dùng cho search patient, doctor, medicine, service

- ❌ **StatusBadge Component**
  - Generic component cho tất cả status types
  - Variants cho từng status

- ❌ **QRCodeDisplay Component**
  - Hiển thị QR code
  - Countdown timer
  - Polling indicator

#### State Machines
- ❌ Formal state machine implementation
  - AppointmentStateMachine
  - MedicalRecordStateMachine
  - LabOrderStateMachine
  - PaymentStateMachine
- ❌ State machine validator/enforcer
- ❌ Transition guards
- ❌ Side effects handlers

#### Validation
- ❌ Zod schemas cho tất cả input types
- ❌ Field-level validators
- ❌ Cross-field validators
- ❌ Error message mapping

#### Utils
- ❌ Date/time formatters (đã có một phần trong appointments)
- ❌ Currency formatter
- ❌ Phone formatter
- ❌ CCCD formatter

---

## 9. 🧪 TESTING

### ❌ Chưa có
- ❌ Unit tests
- ❌ Integration tests
- ❌ E2E tests
- ❌ Test coverage reports

---

## 10. 📝 DOCUMENTATION

### ✅ Đã có
- ✅ BUSINESS_LOGIC_SPEC.json
- ✅ TODO_IMPLEMENTATION.md
- ✅ IMPLEMENTATION_STATUS.md (file này)

### ❌ Chưa có
- ❌ API Documentation (Swagger/OpenAPI)
- ❌ Component Storybook
- ❌ User Manual
- ❌ Developer Guide
- ❌ State Machine Diagrams
- ❌ Database Schema Documentation

---

## 📋 PRIORITY ROADMAP

### 🔥 P0 - Critical (Launch blockers)
**Cần hoàn thành trước khi launch MVP**

1. **Patients Module (UC002)**
   - [ ] API: POST /api/patients, GET /api/patients (search)
   - [ ] UI: Create Patient Form với validation
   - [ ] UI: Patient Search Component (dùng trong appointments)
   - [ ] Types & validation schemas

2. **Medical Records - Basic Flow (UC004)**
   - [ ] API: POST /api/medical-record (cash payment)
   - [ ] UI: Create Medical Record Form từ appointment
   - [ ] UI: Calculate và hiển thị phí khám
   - [ ] Payment method selection (Cash flow only)

3. **Medical Records - Doctor Examination (UC005 Basic)**
   - [ ] API: GET /api/medical-record/{id}
   - [ ] API: PUT /api/medical-record (update fields)
   - [ ] UI: Medical Record Detail Page
   - [ ] UI: Form fields (clinicalExamination, diagnosis, treatmentPlan, note)
   - [ ] UI: [Lưu tạm] button

### 🚀 P1 - High (Launch soon after)
**Cần hoàn thành trong sprint tiếp theo**

4. **Appointments - Create Flow (UC001)**
   - [ ] API: POST /api/appointments
   - [ ] UI: Create Appointment Form đầy đủ
   - [ ] Validation: date/time future, doctor available
   - [ ] Integration với Patient Search

5. **Medical Records - Complete Flow (UC005)**
   - [ ] API: PUT /api/medical-record/status
   - [ ] UI: [Hoàn thành] [Hủy] buttons
   - [ ] State machine implementation
   - [ ] Guards và validation

6. **Payments - QR Flow (UC004)**
   - [ ] API: POST /api/payments/create-link
   - [ ] API: GET /api/payments/status/{orderCode}
   - [ ] UI: QR Payment Modal
   - [ ] Polling implementation (3-5s, max 5 phút)
   - [ ] State machine implementation
   - [ ] Integration: payment success → POST /api/medical-record với invoiceId

7. **Prescriptions (UC007)**
   - [ ] All API endpoints
   - [ ] Create/Edit Prescription UI
   - [ ] Medicine search
   - [ ] Dynamic prescription details list

### 📦 P2 - Medium
**Nice to have, không block launch**

8. **Lab Orders (UC006, UC008)**
   - [ ] All API endpoints
   - [ ] Create Lab Order UI
   - [ ] Lab Orders List/Table
   - [ ] Lab Result Form
   - [ ] State machine implementation

9. **Patient History (UC009)**
   - [ ] API: GET /api/medical-record/patient/{patientId}
   - [ ] UI: Patient Detail Page
   - [ ] UI: Medical Records History List
   - [ ] Highlight DANG_KHAM records

10. **Print Functions (UC010)**
    - [ ] API: GET /api/html/medical-record/{id}
    - [ ] API: GET /api/html/invoice/{medicalRecordId}
    - [ ] UI: Print buttons
    - [ ] Window.print() integration

### 🔧 P3 - Low
**Optimization và enhancement**

11. **State Machines - Formalization**
    - [ ] State machine library/framework
    - [ ] Validators
    - [ ] Guards
    - [ ] Effects handlers

12. **Validation Framework**
    - [ ] Zod schemas cho tất cả forms
    - [ ] Reusable validators
    - [ ] Error message mapping
    - [ ] Field-level và cross-field validation

13. **Testing**
    - [ ] Unit tests cho API functions
    - [ ] Unit tests cho components
    - [ ] Integration tests
    - [ ] E2E tests cho critical flows

14. **Documentation**
    - [ ] API documentation
    - [ ] Component documentation
    - [ ] User manual
    - [ ] Developer guide

---

## 📊 SUMMARY

**Đã hoàn thành:**
- ✅ Authentication & Authorization (100%)
- ✅ Appointments - List & Status Management (80%)
- ✅ API Client Infrastructure (100%)
- ✅ Basic UI Components (shadcn/ui) (100%)

**Đang thiếu chính:**
- ❌ Patients Module (90% chưa có)
- ❌ Medical Records Module (90% chưa có)
- ❌ Payments Module (90% chưa có)
- ❌ Lab Orders Module (90% chưa có)
- ❌ Prescriptions Module (90% chưa có)
- ❌ State Machines (chưa formalized)
- ❌ Validation Framework (chưa systematic)
- ❌ Testing (0%)

**Ước tính công việc còn lại:**
- ~150-200 tasks
- ~8-10 weeks (team 3-4 developers)
- MVP launch có thể đạt được sau 4-6 weeks nếu focus vào P0 + P1

**Next Steps:**
1. Implement P0: Patients + Medical Records (Cash flow)
2. Implement P1: Appointments Create + QR Payment + Prescriptions
3. Implement P2: Lab Orders + Patient History + Print
4. P3: Optimization, testing, documentation
