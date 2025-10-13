# Copilot Instructions - Shadcn Admin (Hospital Management System)

## Project Overview
Healthcare admin dashboard built with React 19, TanStack Router, TanStack Query, shadcn/ui, and Spring Boot backend. The system manages appointments, medical records, prescriptions, lab orders, and payments for a hospital/clinic.

## Architecture & Patterns

### Feature-Based Structure
Organize code by features, not layers. Each feature is self-contained:
```
src/features/{module}/
├── api/              # API client functions
├── components/       # UI components (table, form, detail)
├── hooks/           # React Query custom hooks
├── types.ts         # TypeScript interfaces
└── index.tsx        # Main page component
```

### API Response Handling
Backend returns **inconsistent response formats**. Always validate structure:

**Direct Array Response** (departments, services):
```typescript
const { data } = await get<Department[]>('/departments')
if (Array.isArray(data)) return data.filter(isDepartment)
```

**Wrapped Response** (doctors, appointments):
```typescript
const { data } = await get<ApiResponse>('/doctors')
const response = data ?? {}
const rawData = isRecord(response) ? response.data : undefined
if (Array.isArray(rawData)) return rawData.filter(isDoctor)
```

**Paginated Response** (appointments list):
```typescript
// Spring Data format: {data: {content: [...], pageable: {...}, totalPages: 10}}
// OR direct format: {data: [...], pagination: {page, total}}
// Extract using resolveAppointmentArray() and extractPaginationNumbers()
```

See `src/features/appointments/api/appointments.ts` lines 97-185 for full pagination extraction logic.

### Authentication Flow
1. **Token Storage**: JWT stored in localStorage via `src/lib/auth-storage.ts`
2. **Zustand Store**: Global auth state in `src/stores/auth-store.ts`
3. **Auto Injection**: Axios interceptor in `src/lib/api-client.ts` adds `Authorization: Bearer {token}`
4. **Auto Logout**: 401 responses trigger logout + redirect to login

### Form Validation
All forms use **react-hook-form + Zod**:
```typescript
const formSchema = z.object({
  patientId: z.number(),
  symptoms: z.string().min(1, 'Triệu chứng là bắt buộc'),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
})
```

### Data Fetching with TanStack Query
**Pattern for list queries:**
```typescript
export const useAppointments = (params: AppointmentListParams) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => fetchAppointments(params),
  })
}
```

**Pattern for mutations:**
```typescript
const { mutate: confirmMutation } = useMutation({
  mutationFn: confirmAppointment,
  onSuccess: () => {
    toast.success('Xác nhận thành công')
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
  },
})
```

### Table Components
Follow `src/features/appointments/components/appointments-table.tsx` pattern:
- **URL State**: Sync filters/pagination with URL via `useTableUrlState` hook
- **Column Definitions**: Define with TanStack Table v8 API
- **Action Menus**: Use DropdownMenu for row actions
- **Loading States**: Show Skeleton components during fetch

### Medical Record State Machine
Medical records follow strict status transitions:
- `DANG_KHAM` → Initial examination
- `CHO_XET_NGHIEM` → Waiting for lab results (auto-set when lab order created)
- `HOAN_THANH` → Completed
- `HUY` → Cancelled

**Critical**: Status transitions have business rules. Always check backend API documentation in `docs/api-backend.md` for allowed transitions.

## Backend API Integration

### Base Configuration
- **Base URL**: `http://localhost:8080/api` (configurable via `VITE_API_BASE_URL`)
- **Timeout**: 30 seconds
- **Auth**: JWT token auto-attached to all requests

### Vietnamese Field Names
Backend uses Vietnamese property names and status values:
```typescript
// Status values examples:
'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'DA_DEN' | 'KHONG_DEN'  // Appointments
'DANG_KHAM' | 'CHO_XET_NGHIEM' | 'HOAN_THANH' | 'HUY'    // Medical Records

// Field names:
{ 
  patientName: 'Nguyễn Văn A',    // Not 'name'
  symptoms: 'Đau đầu',             // Not 'complaint'
  clinicalExamination: '...',      // Not 'examination'
}
```

### Date/Time Formats
- **Request**: `yyyy-MM-dd` for dates, `HH:mm:ss` for times
- **Response**: ISO 8601 `yyyy-MM-dd'T'HH:mm:ss` (no timezone)
- **Display**: Use `date-fns` with Vietnamese locale

### Error Handling
API client (`src/lib/api-client.ts`) automatically:
1. Shows toast notifications for errors
2. Logs out on 401 Unauthorized
3. Handles network errors gracefully

**Never** silence errors without user feedback (toast/alert).

## Critical Conventions

### Type Safety
- **Always** define TypeScript interfaces for API responses
- **Never** use `any` type - use `unknown` and type guards instead
- Use type guards like `isRecord()`, `isDepartment()` for runtime validation

### Component Standards
- Functional components with TypeScript
- Use shadcn/ui components (`Button`, `Dialog`, `Select`, etc.)
- Follow RTL (right-to-left) modifications in customized components
- Extract reusable logic to custom hooks

### State Management
- **Local State**: `useState` for component-specific state
- **Server State**: TanStack Query for API data
- **Global State**: Zustand for auth, layout preferences

### Code Style
- **2 spaces** indentation (not tabs)
- **Single quotes** for strings
- **Semicolons** optional (project doesn't enforce)
- **Imports**: Auto-sorted by `@trivago/prettier-plugin-sort-imports`

## Development Workflow

### Running the Project
```bash
pnpm install        # Install dependencies
pnpm dev           # Start dev server (Vite)
pnpm build         # Production build
pnpm lint          # ESLint check
pnpm format        # Prettier format
```

### Creating New Features
1. Create feature folder: `src/features/{module}/`
2. Add API client: `api/{module}.ts` with TypeScript interfaces
3. Create React Query hooks: `hooks/use-{module}.ts`
4. Build components: table, form, detail views
5. Add route in `src/routes/_authenticated/`
6. Update navigation in `src/components/layout/sidebar.tsx`

### Testing API Responses
**Always** log API responses during development:
```typescript
console.log('🔵 [fetchDepartments] Raw response:', data)
console.log('🔵 [fetchDepartments] Is array?', Array.isArray(data))
```
Remove logs before committing to production.

## Common Issues & Solutions

### "Empty array returned from API"
**Cause**: Response structure mismatch (direct array vs wrapped object)
**Fix**: Add debug logs, check if response is `{data: [...]}` or `[...]`, adjust parsing logic

### "Select dropdown not showing after selection"
**Cause**: State not updating or conditional rendering logic error
**Fix**: Check state dependencies, verify `examinationType` matches condition, ensure data array is populated

### "401 Unauthorized"
**Cause**: Token expired or invalid
**Fix**: Check localStorage for token, verify backend token validation, ensure login flow sets token correctly

### "Type error with API response"
**Cause**: Backend changed response structure without frontend update
**Fix**: Check `docs/api-backend.md`, update TypeScript interfaces, adjust parsing logic

## Documentation References
- **API Documentation**: `docs/api-backend.md` and `.claude/api-backend.md`
- **Implementation Status**: `docs/IMPLEMENTATION_STATUS.md`
- **Component TODO**: `docs/FRONTEND_COMPONENTS_TODO.md`

## Important Notes
- **shadcn/ui Components**: Some are customized for RTL support. Check `README.md` for list before updating via CLI
- **Vietnamese UI**: All user-facing text must be in Vietnamese
- **No Tests Yet**: Unit/integration tests not implemented (planned)
- **Payment Integration**: PayOS integration partially implemented in payments feature
