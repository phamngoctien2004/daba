import {
    Calendar,
    CalendarCheck,
    FileText,
    Microscope,
    Settings,
    Stethoscope,
    UserCog,
    Users,
    BarChart3,
    Receipt,
    CalendarClock,
    Building2,
    Briefcase,
    ShieldCheck,
    TrendingUp,
    Bell,
} from 'lucide-react'

import { UserRole } from '@/types/auth'
import { type NavGroup } from '../types'

/**
 * Menu configuration for Lễ tân (Receptionist)
 * - Đặt lịch khám (Appointment Booking)
 * - Phiếu khám (Medical Records)
 * - Quản lý bệnh nhân (Patient Management)
 * - Thông tin cá nhân (Profile)
 */
export const leTanNavGroups: NavGroup[] = [
    {
        title: 'Quản lý',
        items: [
            {
                title: 'Đặt lịch khám',
                url: '/appointments',
                icon: Calendar,
            },
            {
                title: 'Phiếu khám',
                url: '/medical-records',
                icon: FileText,
            },
            {
                title: 'Quản lý bệnh nhân',
                url: '/patients',
                icon: Users,
            },
        ],
    },
    {
        title: 'Cài đặt',
        items: [
            {
                title: 'Thông tin cá nhân',
                url: '/settings',
                icon: UserCog,
            },
        ],
    },
]

/**
 * Menu configuration for Bác sĩ (Doctor)
 * - Khám bệnh (Medical Examination)
 * - Chỉ định xét nghiệm (Lab Orders)
 * - Lịch làm việc (Work Schedule)
 * - Thông tin cá nhân (Profile)
 */
export const bacSiNavGroups: NavGroup[] = [
    {
        title: 'Công việc',
        items: [
            {
                title: 'Khám bệnh',
                url: '/doctor-medical-records',
                icon: Stethoscope,
            },
            {
                title: 'Chỉ định xét nghiệm',
                url: '/lab-orders',
                icon: Microscope,
            },
            {
                title: 'Lịch làm việc',
                url: '/doctor-schedules',
                icon: CalendarCheck,
            },
            {
                title: 'Bệnh nhân',
                url: '/patients',
                icon: Users,
            },
        ],
    },
    {
        title: 'Cài đặt',
        items: [
            {
                title: 'Thông tin cá nhân',
                url: '/settings',
                icon: UserCog,
            },
        ],
    },
]

/**
 * Menu configuration for Admin
 * - Full access to all features including system management
 */
export const adminNavGroups: NavGroup[] = [
    {
        title: 'Tổng quan',
        items: [
            {
                title: 'Báo cáo & Thống kê',
                url: '/admin/reports',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Quản lý nghiệp vụ',
        items: [
            {
                title: 'Quản lý hóa đơn',
                url: '/admin/invoices',
                icon: Receipt,
            },
            {
                title: 'Lịch làm việc bác sĩ',
                url: '/admin/doctor-schedules',
                icon: CalendarClock,
            },
        ],
    },
    {
        title: 'Quản lý nhân sự',
        items: [
            {
                title: 'Quản lý bác sĩ',
                url: '/admin/doctors',
                icon: Stethoscope,
            },
            {
                title: 'Quản lý bệnh nhân',
                url: '/admin/patients',
                icon: Users,
            },
        ],
    },
    {
        title: 'Quản lý hệ thống',
        items: [
            {
                title: 'Quản lý dịch vụ khám',
                url: '/admin/services',
                icon: Briefcase,
            },
            {
                title: 'Quản lý khoa',
                icon: Building2,
                items: [
                    {
                        title: 'Danh sách khoa',
                        url: '/admin/departments',
                    },
                    {
                        title: 'Quản lý phòng khám',
                        url: '/admin/rooms',
                    },
                ],
            },
            {
                title: 'Quản lý tài khoản',
                url: '/admin/users',
                icon: ShieldCheck,
            },
            {
                title: 'Quản lý thông báo',
                url: '/admin/notifications',
                icon: Bell,
            },
        ],
    },
    {
        title: 'Báo cáo & Thống kê',
        items: [
            {
                title: 'Báo cáo hệ thống',
                url: '/admin/reports',
                icon: TrendingUp,
            },
        ],
    },
    {
        title: 'Cài đặt',
        items: [
            {
                title: 'Cài đặt hệ thống',
                url: '/settings',
                icon: Settings,
            },
        ],
    },
]

/**
 * Get navigation groups based on user role
 */
export const getNavGroupsByRole = (role: UserRole): NavGroup[] => {
    switch (role) {
        case UserRole.LE_TAN:
            return leTanNavGroups
        case UserRole.BAC_SI:
            return bacSiNavGroups
        case UserRole.ADMIN:
            return adminNavGroups
        default:
            return []
    }
}
