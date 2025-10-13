# API INTEGRATION CHECKLIST

**Dự án:** Hệ thống Quản lý Phòng khám
**Tài liệu tham chiếu:** BUSINESS_LOGIC_SPEC.json
**Ngày cập nhật:** 2025-10-13

---

## 📋 HƯỚNG DẪN SỬ DỤNG

Checklist này liệt kê TẤT CẢ các API endpoints cần integrate theo từng Use Case.

**Ký hiệu:**
- ✅ Đã integrate và test
- 🚧 Đang implement
- ❌ Chưa bắt đầu
- ⚠️ Cần review/fix

---

## 1. 🔐 AUTHENTICATION

### Login
- ✅ **POST /api/auth/dashboard/login**
  - **UC:** Authentication
  - **Payload:**
    ```json
    {
      "username": "email@example.com",
      "password": "password123"
    }
    ```
  - **Response:**
    ```json
    {
      "data": {
        "accessToken": "jwt_token",
        "userResponse": {
          "id": 1,
          "email": "email@example.com",
          "role": "LE_TAN" | "BAC_SI" | "ADMIN",
          "status": true,
          "createdAt": "2025-10-13T10:00:00Z",
          "doctor": { ... } // if role = BAC_SI
        }
      },
      "message": "Đăng nhập thành công"
    }
    ```
  - **File:** `src/lib/api/auth.api.ts`
  - **Errors:** AUTH_002 (sai username/password)

### Logout
- ✅ **Client-side only** (clear localStorage, redirect)
  - **File:** `src/stores/auth-store.ts` - logout()

---

## 2. 📅 APPOINTMENTS MODULE

### UC001: Đặt lịch khám cho bệnh nhân

#### Fetch Appointments List
- ✅ **GET /api/appointments**
  - **Query Params:**
    - `phone` (optional): string
    - `date` (optional): YYYY-MM-DD
    - `status` (optional): CHO_XAC_NHAN | DA_XAC_NHAN | DA_DEN | KHONG_DEN
    - `page` (optional): number (default: 1)
    - `pageSize` (optional): number (default: 10)
  - **Response:**
    ```json
    {
      "data": {
        "items": [ /* Appointment[] */ ],
        "page": 1,
        "pageSize": 10,
        "total": 50,
        "totalPages": 5
      },
      "message": "Lấy danh sách lịch khám thành công"
    }
    ```
  - **File:** `src/features/appointments/api/appointments.ts` - fetchAppointments()
  - **Errors:** AUTH_001, AUTH_003

#### Create Appointment
- ❌ **POST /api/appointments**
  - **UC:** UC001
  - **Payload:**
    ```json
    {
      "patientId": 1,
      "doctorId": 10,
      "departmentId": 3,
      "appointmentDate": "2025-10-15",
      "appointmentTime": "14:00",
      "symptoms": "Đau đầu",
      "notes": "Ghi chú"
    }
    ```
  - **Headers:**
    - `X-Idempotency-Key`: string (UUID, expiry: 24h)
  - **Response:**
    ```json
    {
      "data": {
        "id": 101,
        "code": "LH1697123456789",
        "status": "CHO_XAC_NHAN",
        // ... other fields
      },
      "message": "Tạo lịch khám thành công"
    }
    ```
  - **File:** 🚧 Cần tạo trong `src/features/appointments/api/appointments.ts`
  - **Errors:** VAL_001, VAL_002, BIZ_002, NOT_FOUND_001

### UC003: Xác nhận lịch hẹn

#### Confirm Appointment Status
- ✅ **PUT /api/appointments/confirm**
  - **UC:** UC003
  - **Payload:**
    ```json
    {
      "id": 101,
      "status": "DA_XAC_NHAN" | "DA_DEN" | "KHONG_DEN"
    }
    ```
  - **Response:**
    ```json
    {
      "data": { /* Updated Appointment */ },
      "message": "Cập nhật trạng thái thành công"
    }
    ```
  - **File:** `src/features/appointments/api/appointments.ts` - confirmAppointment()
  - **Errors:** NOT_FOUND_002, BIZ_004

---

## 3. 👤 PATIENTS MODULE

### UC002: Tạo hồ sơ bệnh nhân mới

#### Search Patients
- ❌ **GET /api/patients**
  - **UC:** UC001 (search trong appointment creation flow)
  - **Query Params:**
    - `phone` (optional): string
    - `keyword` (optional): string (search by name, cccd)
    - `page` (optional): number
    - `pageSize` (optional): number
  - **Response:**
    ```json
    {
      "data": {
        "items": [ /* Patient[] */ ],
        "pagination": { ... }
      },
      "message": "Lấy danh sách bệnh nhân thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/patients/api/patients.ts`
  - **Errors:** AUTH_001, AUTH_003

#### Create Patient
- ❌ **POST /api/patients**
  - **UC:** UC002
  - **Payload:**
    ```json
    {
      "phone": "0912345678",
      "email": "patient@example.com",
      "fullName": "Nguyễn Văn A",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "cccd": "001234567890",
      "birth": "1990-01-01",
      "gender": "NAM" | "NU",
      "bloodType": "A" | "B" | "AB" | "O",
      "weight": 70,
      "height": 175,
      "profileImage": "https://...",
      "phoneLink": "0987654321"
    }
    ```
  - **Headers:**
    - `X-Idempotency-Key`: string
  - **Response:**
    ```json
    {
      "data": {
        "id": 1,
        "code": "BN1697123456789",
        "relationship": "CHU TAI KHOAN",
        "registrationDate": "2025-10-13",
        // ... other fields
      },
      "message": "Tạo bệnh nhân thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/patients/api/patients.ts`
  - **Errors:** VAL_001, VAL_002, VAL_003, BIZ_001

#### Get Patient Detail
- ❌ **GET /api/patients/{id}**
  - **UC:** UC009, general
  - **Response:**
    ```json
    {
      "data": { /* Patient object */ },
      "message": "Lấy thông tin bệnh nhân thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/patients/api/patients.ts`
  - **Errors:** NOT_FOUND_001

#### Update Patient
- ❌ **PUT /api/patients/{id}**
  - **UC:** UC002 (update existing patient)
  - **Payload:** Same as Create Patient (partial update)
  - **Response:**
    ```json
    {
      "data": { /* Updated Patient */ },
      "message": "Cập nhật thông tin bệnh nhân thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/patients/api/patients.ts`
  - **Errors:** NOT_FOUND_001, VAL_001, VAL_002, BIZ_001

### UC009: Xem lịch sử khám bệnh

#### Get Patient Medical History
- ❌ **GET /api/medical-record/patient/{patientId}**
  - **UC:** UC009
  - **Response:**
    ```json
    {
      "data": [ /* MedicalRecord[] sorted by date desc */ ],
      "message": "Lấy lịch sử khám bệnh thành công"
    }
    ```
  - **Cache:** 60s TTL
  - **File:** 🚧 Cần tạo `src/features/medical-records/api/medical-records.ts`
  - **Errors:** NOT_FOUND_001

---

## 4. 🏥 MEDICAL RECORDS MODULE

### UC004: Tạo phiếu khám và thanh toán

#### Create Medical Record (Cash Payment)
- ❌ **POST /api/medical-record**
  - **UC:** UC004 (cash flow)
  - **Payload:**
    ```json
    {
      "patientId": 1,
      "doctorId": 10,
      "healthPlanId": 5,
      "symptoms": "Sốt cao, đau đầu",
      "invoiceId": null // null for cash, integer for QR payment
    }
    ```
  - **Headers:**
    - `X-Idempotency-Key`: string
  - **Response:**
    ```json
    {
      "data": {
        "id": "111",
        "code": "PK1697123456789",
        "status": "DANG_KHAM",
        "patientId": 1,
        "symptoms": "Sốt cao, đau đầu",
        // ... other fields
      },
      "message": "Tạo phiếu khám thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/medical-records/api/medical-records.ts`
  - **Errors:** NOT_FOUND_001, VAL_001

### UC005: Bác sĩ khám bệnh và cập nhật phiếu khám

#### Get Medical Record Detail
- ❌ **GET /api/medical-record/{id}**
  - **UC:** UC005
  - **Response:**
    ```json
    {
      "data": {
        "id": "111",
        "code": "PK1697123456789",
        "symptoms": "Sốt cao",
        "clinicalExamination": "...",
        "diagnosis": "Viêm phổi",
        "treatmentPlan": "...",
        "note": "...",
        "status": "DANG_KHAM",
        "total": 500000,
        "paid": 500000,
        "patientId": 1,
        "patientName": "Nguyễn Văn A",
        "date": "2025-10-13T10:00:00Z",
        "invoiceDetailsResponse": [ /* InvoiceDetail[] */ ]
      },
      "message": "Lấy chi tiết phiếu khám thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/medical-records/api/medical-records.ts`
  - **Errors:** NOT_FOUND_003

#### Update Medical Record (Lưu tạm)
- ❌ **PUT /api/medical-record**
  - **UC:** UC005
  - **Payload:**
    ```json
    {
      "id": "111",
      "clinicalExamination": "Khám lâm sàng...",
      "diagnosis": "Viêm phổi",
      "treatmentPlan": "Điều trị...",
      "note": "Ghi chú..."
    }
    ```
  - **Guard:** status = DANG_KHAM hoặc CHO_XET_NGHIEM
  - **Response:**
    ```json
    {
      "data": { /* Updated MedicalRecord */ },
      "message": "Cập nhật phiếu khám thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/medical-records/api/medical-records.ts`
  - **Errors:** NOT_FOUND_003, BIZ_003, BIZ_004

#### Update Medical Record Status
- ❌ **PUT /api/medical-record/status**
  - **UC:** UC005
  - **Payload:**
    ```json
    {
      "id": "111",
      "status": "HOAN_THANH" | "HUY"
    }
    ```
  - **Guard:**
    - DANG_KHAM → HOAN_THANH (requires diagnosis not null)
    - CHO_XET_NGHIEM → HOAN_THANH
    - DANG_KHAM/CHO_XET_NGHIEM → HUY
  - **Response:**
    ```json
    {
      "data": { /* Updated MedicalRecord */ },
      "message": "Cập nhật trạng thái phiếu khám thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/medical-records/api/medical-records.ts`
  - **Errors:** NOT_FOUND_003, BIZ_004, BIZ_005

### UC010: In phiếu khám và hóa đơn

#### Get Medical Record HTML
- ❌ **GET /api/html/medical-record/{id}**
  - **UC:** UC010
  - **Response:** HTML content (text/html)
  - **File:** 🚧 Cần tạo `src/features/medical-records/api/medical-records.ts`
  - **Errors:** NOT_FOUND_003

#### Get Invoice HTML
- ❌ **GET /api/html/invoice/{medicalRecordId}**
  - **UC:** UC010
  - **Response:** HTML content (text/html)
  - **File:** 🚧 Cần tạo `src/features/medical-records/api/medical-records.ts`
  - **Errors:** NOT_FOUND_003

---

## 5. 💳 PAYMENTS MODULE

### UC004: QR Payment Flow

#### Create Payment Link
- ❌ **POST /api/payments/create-link**
  - **UC:** UC004 (QR payment)
  - **Payload:**
    ```json
    {
      "medicalRecordId": 111,
      "labOrderIds": [81, 82],
      "healthPlanIds": [5, 6],
      "doctorId": 10,
      "totalAmount": 500000
    }
    ```
  - **Response:**
    ```json
    {
      "data": {
        "invoiceId": 201,
        "qrCode": "data:image/png;base64,...",
        "orderCode": 123456789
      },
      "message": "Tạo link thanh toán thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/payments/api/payments.ts`
  - **Errors:** VAL_001, BIZ_006

#### Check Payment Status (Polling)
- ❌ **GET /api/payments/status/{orderCode}**
  - **UC:** UC004 (QR payment polling)
  - **Query Params:**
    - `orderCode`: number
  - **Response:**
    ```json
    {
      "data": {
        "success": true,
        "status": "DA_THANH_TOAN" | "DANG_CHO_THANH_TOAN" | "THAT_BAI",
        "invoiceId": 201
      },
      "message": "Kiểm tra trạng thái thanh toán thành công"
    }
    ```
  - **Cache:** 300s (5 phút)
  - **Polling Strategy:**
    - Interval: 3-5 giây
    - Max duration: 5 phút
    - Stop on: success, fail, timeout
  - **File:** 🚧 Cần tạo `src/features/payments/api/payments.ts`
  - **Errors:** NOT_FOUND (orderCode invalid), BIZ_006

---

## 6. 🧪 LAB ORDERS MODULE

### UC006: Thêm chỉ định xét nghiệm/dịch vụ

#### Get Health Plans (Services/Tests)
- ❌ **GET /api/services**
  - **UC:** UC006 (search services)
  - **Query Params:**
    - `keyword` (optional): string
    - `page` (optional): number
    - `pageSize` (optional): number
  - **Response:**
    ```json
    {
      "data": {
        "items": [
          {
            "id": 1,
            "name": "Xét nghiệm máu tổng quát",
            "price": 200000,
            "typeService": "SINGLE" | "MULTIPLE"
          }
        ],
        "pagination": { ... }
      },
      "message": "Lấy danh sách dịch vụ thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/lab-orders/api/lab-orders.ts` hoặc `src/features/services/api/services.ts`
  - **Errors:** AUTH_001

#### Get Doctors (Available)
- ❌ **GET /api/doctors**
  - **UC:** UC006 (select performing doctor)
  - **Query Params:**
    - `available` (optional): boolean (true)
    - `departmentId` (optional): number
  - **Response:**
    ```json
    {
      "data": [
        {
          "id": 10,
          "fullName": "Bác sĩ Nguyễn Văn B",
          "position": "Bác sĩ chuyên khoa",
          "available": true,
          "examinationFee": 300000
        }
      ],
      "message": "Lấy danh sách bác sĩ thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/doctors/api/doctors.ts` hoặc trong lab-orders
  - **Errors:** AUTH_001

#### Create Lab Order
- ❌ **POST /api/lab-orders**
  - **UC:** UC006
  - **Payload:**
    ```json
    {
      "recordId": 111,
      "healthPlanId": 2,
      "performingDoctorId": 20,
      "diagnosis": "Nghi ngờ viêm phổi"
    }
    ```
  - **Response:**
    ```json
    {
      "data": {
        "id": 81,
        "code": "XN1697123456789",
        "status": "CHO_THUC_HIEN",
        "recordId": 111,
        // ... other fields
      },
      "message": "Tạo chỉ định xét nghiệm thành công"
    }
    ```
  - **Side Effect:** Medical record status auto chuyển sang CHO_XET_NGHIEM
  - **Guard:** Medical record status = DANG_KHAM
  - **Headers:** `X-Idempotency-Key`
  - **File:** 🚧 Cần tạo `src/features/lab-orders/api/lab-orders.ts`
  - **Errors:** NOT_FOUND_003, BIZ_003

### UC008: Thực hiện xét nghiệm và nhập kết quả

#### Update Lab Order Status
- ❌ **PUT /api/lab-orders/status**
  - **UC:** UC008
  - **Payload:**
    ```json
    {
      "id": 81,
      "status": "DANG_THUC_HIEN" | "HOAN_THANH" | "HUY_BO"
    }
    ```
  - **Guard:**
    - CHO_THUC_HIEN → DANG_THUC_HIEN (requires statusPayment = DA_THANH_TOAN)
    - DANG_THUC_HIEN → HOAN_THANH (after lab result created)
    - CHO_THUC_HIEN/DANG_THUC_HIEN → HUY_BO
  - **Response:**
    ```json
    {
      "data": { /* Updated LabOrder */ },
      "message": "Cập nhật trạng thái xét nghiệm thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/lab-orders/api/lab-orders.ts`
  - **Errors:** NOT_FOUND_004, BIZ_004

#### Create Lab Result
- ❌ **POST /api/lab-results**
  - **UC:** UC008
  - **Payload:**
    ```json
    {
      "labOrderId": 81,
      "resultDetails": "Kết quả bình thường",
      "note": "Không có gì bất thường",
      "explanation": "Giải thích kết quả..."
    }
    ```
  - **Response:**
    ```json
    {
      "data": {
        "id": 1001,
        "labOrderId": 81,
        // ... other fields
      },
      "message": "Nhập kết quả xét nghiệm thành công"
    }
    ```
  - **Side Effect:** Lab order status auto chuyển sang HOAN_THANH
  - **File:** 🚧 Cần tạo `src/features/lab-orders/api/lab-orders.ts`
  - **Errors:** NOT_FOUND_004

#### Update Lab Result
- ❌ **PUT /api/lab-results**
  - **UC:** UC008
  - **Payload:** Same as Create Lab Result
  - **Guard:** Lab order status = DANG_THUC_HIEN
  - **Response:**
    ```json
    {
      "data": { /* Updated LabResult */ },
      "message": "Cập nhật kết quả xét nghiệm thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/lab-orders/api/lab-orders.ts`
  - **Errors:** NOT_FOUND_004, BIZ_004

#### Delete Lab Orders (Batch)
- ❌ **DELETE /api/lab-orders**
  - **UC:** UC008 (cancel multiple lab orders)
  - **Payload:**
    ```json
    {
      "ids": [81, 82, 83]
    }
    ```
  - **Guard:** All lab orders status = CHO_THUC_HIEN
  - **Response:**
    ```json
    {
      "message": "Xóa chỉ định xét nghiệm thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/lab-orders/api/lab-orders.ts`
  - **Errors:** NOT_FOUND_004, BIZ_004

---

## 7. 💊 PRESCRIPTIONS MODULE

### UC007: Tạo đơn thuốc

#### Create Prescription Container
- ❌ **POST /api/prescriptions**
  - **UC:** UC007
  - **Payload:**
    ```json
    {
      "medicalRecordId": "111",
      "generalInstructions": "Uống sau ăn"
    }
    ```
  - **Response:**
    ```json
    {
      "data": {
        "id": 501,
        "code": "DT1697123456789",
        "medicalRecordId": "111",
        "generalInstructions": "Uống sau ăn"
      },
      "message": "Tạo đơn thuốc thành công"
    }
    ```
  - **Guard:** Medical record status = DANG_KHAM
  - **File:** 🚧 Cần tạo `src/features/prescriptions/api/prescriptions.ts`
  - **Errors:** NOT_FOUND_003, BIZ_005

#### Get Medicines
- ❌ **GET /api/medicines**
  - **UC:** UC007 (search medicines)
  - **Query Params:**
    - `keyword` (optional): string
  - **Response:**
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Paracetamol 500mg",
          "unit": "Viên",
          "price": 2000
        }
      ],
      "message": "Lấy danh sách thuốc thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/prescriptions/api/prescriptions.ts`
  - **Errors:** AUTH_001

#### Add Medicine to Prescription
- ❌ **POST /api/prescriptions/details**
  - **UC:** UC007
  - **Payload:**
    ```json
    {
      "prescriptionId": 501,
      "medicineId": 1,
      "quantity": 10,
      "usageInstructions": "2 viên/ngày, uống sau ăn"
    }
    ```
  - **Response:**
    ```json
    {
      "data": {
        "id": 5001,
        "prescriptionId": 501,
        "medicineId": 1,
        "quantity": 10,
        "usageInstructions": "2 viên/ngày, uống sau ăn"
      },
      "message": "Thêm thuốc vào đơn thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/prescriptions/api/prescriptions.ts`
  - **Errors:** NOT_FOUND_005, BIZ_005

#### Update Prescription Detail
- ❌ **PUT /api/prescriptions/details**
  - **UC:** UC007
  - **Payload:** Same as Add Medicine
  - **Response:**
    ```json
    {
      "data": { /* Updated PrescriptionDetail */ },
      "message": "Cập nhật thuốc thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/prescriptions/api/prescriptions.ts`
  - **Errors:** NOT_FOUND_005, BIZ_005

#### Delete Prescription Detail
- ❌ **DELETE /api/prescriptions/details/{id}**
  - **UC:** UC007
  - **Response:**
    ```json
    {
      "message": "Xóa thuốc khỏi đơn thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/prescriptions/api/prescriptions.ts`
  - **Errors:** NOT_FOUND_005, BIZ_005

#### Update Prescription General Instructions
- ❌ **PUT /api/prescriptions**
  - **UC:** UC007
  - **Payload:**
    ```json
    {
      "id": 501,
      "generalInstructions": "Updated instructions"
    }
    ```
  - **Response:**
    ```json
    {
      "data": { /* Updated Prescription */ },
      "message": "Cập nhật đơn thuốc thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/prescriptions/api/prescriptions.ts`
  - **Errors:** NOT_FOUND_005, BIZ_005

---

## 8. 🏢 DEPARTMENTS & DOCTORS (Supporting APIs)

### Get Departments
- ❌ **GET /api/departments**
  - **UC:** UC001 (select department in appointment creation)
  - **Response:**
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Khoa Nội",
          "description": "Khoa khám và điều trị bệnh nội khoa"
        }
      ],
      "message": "Lấy danh sách khoa thành công"
    }
    ```
  - **File:** 🚧 Cần tạo `src/features/departments/api/departments.ts`

### Get Doctors by Department
- ❌ **GET /api/doctors**
  - **UC:** UC001
  - **Query Params:**
    - `departmentId` (optional): number
    - `available` (optional): boolean
  - **Response:** (same as UC006 Get Doctors)
  - **File:** 🚧 Cần tạo `src/features/doctors/api/doctors.ts`

---

## 📊 IMPLEMENTATION PROGRESS

### By Module

| Module | Total APIs | Completed | In Progress | Not Started |
|--------|-----------|-----------|-------------|-------------|
| **Authentication** | 1 | 1 ✅ | 0 | 0 |
| **Appointments** | 2 | 1 ✅ | 0 | 1 ❌ |
| **Patients** | 4 | 0 | 0 | 4 ❌ |
| **Medical Records** | 6 | 0 | 0 | 6 ❌ |
| **Payments** | 2 | 0 | 0 | 2 ❌ |
| **Lab Orders** | 7 | 0 | 0 | 7 ❌ |
| **Prescriptions** | 6 | 0 | 0 | 6 ❌ |
| **Departments/Doctors** | 2 | 0 | 0 | 2 ❌ |
| **TOTAL** | **30** | **2** | **0** | **28** |

### By Priority

#### P0 - Critical (8 APIs)
- ❌ POST /api/patients
- ❌ GET /api/patients (search)
- ❌ POST /api/medical-record
- ❌ GET /api/medical-record/{id}
- ❌ PUT /api/medical-record
- ❌ POST /api/appointments
- ❌ GET /api/departments
- ❌ GET /api/doctors

#### P1 - High (10 APIs)
- ❌ PUT /api/medical-record/status
- ❌ POST /api/payments/create-link
- ❌ GET /api/payments/status/{orderCode}
- ❌ POST /api/prescriptions
- ❌ GET /api/medicines
- ❌ POST /api/prescriptions/details
- ❌ PUT /api/prescriptions/details
- ❌ DELETE /api/prescriptions/details/{id}
- ❌ PUT /api/prescriptions
- ❌ GET /api/medical-record/patient/{patientId}

#### P2 - Medium (10 APIs)
- ❌ GET /api/services
- ❌ POST /api/lab-orders
- ❌ PUT /api/lab-orders/status
- ❌ POST /api/lab-results
- ❌ PUT /api/lab-results
- ❌ DELETE /api/lab-orders
- ❌ PUT /api/patients/{id}
- ❌ GET /api/patients/{id}
- ❌ GET /api/html/medical-record/{id}
- ❌ GET /api/html/invoice/{medicalRecordId}

---

## 🎯 NEXT STEPS

### Sprint 1: P0 APIs (Week 1-2)
1. **Patients Module**
   - [ ] Implement POST /api/patients
   - [ ] Implement GET /api/patients (search)
   - [ ] Create types & validation schemas
   - [ ] Unit tests

2. **Medical Records Module (Basic)**
   - [ ] Implement POST /api/medical-record
   - [ ] Implement GET /api/medical-record/{id}
   - [ ] Implement PUT /api/medical-record
   - [ ] Create types
   - [ ] Unit tests

3. **Appointments Module (Complete)**
   - [ ] Implement POST /api/appointments
   - [ ] Add idempotency key handling
   - [ ] Unit tests

4. **Supporting APIs**
   - [ ] Implement GET /api/departments
   - [ ] Implement GET /api/doctors
   - [ ] Create types

### Sprint 2: P1 APIs (Week 3-4)
5. **Medical Records (Complete)**
   - [ ] Implement PUT /api/medical-record/status
   - [ ] State machine validation

6. **Payments Module**
   - [ ] Implement POST /api/payments/create-link
   - [ ] Implement GET /api/payments/status/{orderCode}
   - [ ] Polling logic
   - [ ] State machine

7. **Prescriptions Module**
   - [ ] Implement all 5 prescription APIs
   - [ ] Medicine search
   - [ ] Unit tests

8. **Patient History**
   - [ ] Implement GET /api/medical-record/patient/{patientId}
   - [ ] Caching logic

### Sprint 3: P2 APIs (Week 5-6)
9. **Lab Orders Module**
   - [ ] Implement all 6 lab order APIs
   - [ ] Health plans search
   - [ ] State machine
   - [ ] Unit tests

10. **Patients & Medical Records (Polish)**
    - [ ] PUT /api/patients/{id}
    - [ ] GET /api/patients/{id}
    - [ ] GET /api/html/medical-record/{id}
    - [ ] GET /api/html/invoice/{medicalRecordId}

---

## 📝 NOTES

### Idempotency Keys
Required for these endpoints:
- POST /api/appointments
- POST /api/patients
- POST /api/medical-record
- POST /api/lab-orders

**Implementation:**
- Generate UUID on client side
- Attach as `X-Idempotency-Key` header
- Backend caches for 24h (86400s)
- Retry với cùng key sẽ trả về cùng response

### Caching Strategy
- **Patient History:** 60s TTL
- **Payment Status:** 300s (5 phút) TTL
- Implement với React Query's `staleTime` và `cacheTime`

### Error Handling
- All APIs should handle errors from `BUSINESS_LOGIC_SPEC.json` errors section
- Use centralized error mapping in `src/lib/handle-server-error.ts`
- Display user-friendly messages via toast

### Testing Checklist for Each API
- [ ] Happy path test
- [ ] Validation error tests (VAL_001, VAL_002, VAL_003)
- [ ] Business logic error tests (BIZ_001-006)
- [ ] Not found error tests (NOT_FOUND_001-005)
- [ ] Auth error tests (AUTH_001-003)
- [ ] Network error handling
- [ ] Loading states
- [ ] Success states
