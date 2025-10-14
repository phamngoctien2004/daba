# Payment Implementation - Medical Record Detail

## Overview
Implementation of payment confirmation functionality for medical records with support for cash and QR payment methods.

## Implementation Date
October 14, 2025

## Features Implemented

### 1. Cash Payment (✅ Completed)
When user selects "Tiền mặt" payment method:
- **Button**: "Xác nhận thanh toán" 
- **API**: `POST /api/invoices/pay-cash`
- **Behavior**:
  1. Filters unpaid invoices (status: `CHUA_THANH_TOAN` or `THANH_TOAN_MOT_PHAN`)
  2. Calculates total unpaid amount
  3. Calls payment API with:
     - `medicalRecordId`: Medical record ID
     - `healthPlanIds`: Array of unpaid health plan IDs
     - `totalAmount`: Total amount to pay
  4. Shows loading state during payment processing
  5. Displays success/error toast notification
  6. Automatically refreshes data after successful payment

### 2. QR Payment (⏳ Pending Implementation)
When user selects "Chuyển khoản QR" payment method:
- **Button**: "Tạo mã QR" (replaces "Xác nhận thanh toán")
- **Current Behavior**: Shows info toast "Chức năng tạo mã QR đang được phát triển"
- **Future Implementation**: Will generate QR code for payment

### 3. Print Invoice (⏳ Pending Implementation)
- **Button**: "In hóa đơn" (always visible regardless of payment method)
- **API**: `GET /api/html/invoice/{medicalRecordId}`
- **Current Behavior**: Console log only
- **Future Implementation**: Will fetch HTML invoice and trigger browser print dialog

## Technical Details

### API Functions
**File**: `src/features/medical-records/api/medical-records.ts`

```typescript
export interface PayCashPayload {
  medicalRecordId: number
  healthPlanIds: number[]
  totalAmount: number
}

export const payCash = async (payload: PayCashPayload): Promise<{ message: string }>
```

### Custom Hooks
**File**: `src/features/medical-records/hooks/use-medical-record-detail.ts`

```typescript
export const usePayCash = () => {
  // Returns mutation with automatic query invalidation and toast notifications
}
```

### Component Logic
**File**: `src/features/medical-records/components/medical-record-detail-page.tsx`

Key features:
- Conditional rendering based on `paymentMethod` state ('cash' | 'qr')
- Automatic filtering of unpaid invoices
- Loading state management (`isPayingCash`)
- Error handling with user-friendly messages
- Query invalidation after successful payment

## Payment Flow

### Cash Payment Flow
```
1. User selects "Tiền mặt" → paymentMethod = 'cash'
2. User clicks "Xác nhận thanh toán"
3. Component filters unpaid invoices:
   - status === 'CHUA_THANH_TOAN' OR 'THANH_TOAN_MOT_PHAN'
4. Calculate total unpaid amount:
   - totalUnpaid = Σ(healthPlanPrice - paid)
5. Build payload:
   {
     medicalRecordId: number,
     healthPlanIds: [id1, id2, ...],
     totalAmount: totalUnpaid
   }
6. Call API: POST /api/invoices/pay-cash
7. On success:
   - Show toast notification
   - Invalidate queries (auto-refetch)
   - Update UI with new payment status
8. On error:
   - Show error toast with description
```

### QR Payment Flow (Future)
```
1. User selects "Chuyển khoản QR" → paymentMethod = 'qr'
2. User clicks "Tạo mã QR"
3. TODO: Generate QR code for payment
4. TODO: Show QR code in dialog/modal
5. TODO: Poll payment status or webhook
6. TODO: Update UI when payment confirmed
```

## UI/UX Considerations

### Payment Method Selection
- Radio group with 2 options: "Tiền mặt" and "Chuyển khoản QR"
- Default selection: "Tiền mặt"
- Clear visual feedback for selected option

### Button States
- **Cash Payment**:
  - Enabled: "Xác nhận thanh toán"
  - Disabled: "Đang xử lý..." (during API call)
- **QR Payment**:
  - Always enabled: "Tạo mã QR"

### Conditional Display
Payment section only shows when:
```typescript
(record.paid ?? 0) < record.total
```
This ensures payment UI is hidden when fully paid.

### Error Handling
1. **No unpaid invoices**: Toast error "Không có hóa đơn cần thanh toán"
2. **API error**: Toast error with error message description
3. **Network error**: Handled by API client with auto-logout on 401

## Data Validation

### Payload Validation
Before calling API, the component ensures:
- ✅ `medicalRecordId` is a valid number
- ✅ `healthPlanIds` is non-empty array
- ✅ `totalAmount` is calculated correctly from unpaid invoices
- ✅ Only unpaid/partially paid invoices are included

### Response Handling
After successful payment:
- Queries are invalidated: `['medical-record']` and `['medical-records']`
- UI auto-updates with new payment status
- Invoice status changes from `CHUA_THANH_TOAN` → `DA_THANH_TOAN`

## Testing Checklist

### Manual Testing
- [ ] Cash payment with single unpaid invoice
- [ ] Cash payment with multiple unpaid invoices
- [ ] Cash payment with partially paid invoice
- [ ] QR payment button shows "Tạo mã QR"
- [ ] QR payment shows info toast
- [ ] Payment section hidden when fully paid
- [ ] Loading state shows during payment
- [ ] Success toast appears after payment
- [ ] Error toast appears on payment failure
- [ ] Data refreshes after successful payment

### Edge Cases
- [ ] Empty unpaid invoices array
- [ ] Zero total amount
- [ ] Invalid medical record ID
- [ ] Network timeout
- [ ] API returns error
- [ ] Concurrent payment attempts

## Future Enhancements

### QR Payment Implementation
1. Call payment API to generate QR code
2. Display QR code in modal/dialog
3. Show payment instructions
4. Implement payment status polling
5. Handle payment confirmation webhook
6. Update UI when payment verified

### Print Invoice Implementation
1. Call `GET /api/html/invoice/{medicalRecordId}`
2. Open HTML in new window or iframe
3. Trigger browser print dialog
4. Handle print success/cancel events
5. Consider PDF export option

### Additional Features
- Multiple payment methods in single transaction
- Partial payment amount input
- Payment history view
- Receipt generation
- Payment confirmation email/SMS
- Payment refund functionality

## Dependencies
- TanStack Query: Query and mutation management
- sonner: Toast notifications
- React Hook Form (future): Payment amount input validation
- QR Code library (future): QR code generation

## API Documentation Reference
See: `/docs/api-backend.md` section "12. Invoice API"
- Endpoint: `POST /api/invoices/pay-cash`
- Request body: `{ medicalRecordId, healthPlanIds, totalAmount }`
- Response: `{ data: "", message: "Payment successful" }`

## Related Files
- `src/features/medical-records/components/medical-record-detail-page.tsx` - Main UI component
- `src/features/medical-records/api/medical-records.ts` - API functions
- `src/features/medical-records/hooks/use-medical-record-detail.ts` - React hooks
- `src/features/medical-records/types.ts` - TypeScript interfaces
- `docs/api-backend.md` - Backend API documentation
