import {
    Calendar,
    CalendarCheck,
    ClipboardList,
    FileText,
    Microscope,
    Settings,
    Stethoscope,
    User,
    UserCog,
    Users,
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
                url: '/schedules',
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
 * - Full access to all features
 */
export const adminNavGroups: NavGroup[] = [
    {
        title: 'Quản trị',
        items: [
            {
                title: 'Dashboard',
                url: '/',
                icon: ClipboardList,
            },
            {
                title: 'Quản lý người dùng',
                url: '/users',
                icon: Users,
            },
            {
                title: 'Quản lý bệnh nhân',
                url: '/patients',
                icon: User,
            },
            {
                title: 'Lịch khám',
                url: '/appointments',
                icon: Calendar,
            },
            {
                title: 'Phiếu khám',
                url: '/medical-records',
                icon: FileText,
            },
            {
                title: 'Xét nghiệm',
                url: '/lab-orders',
                icon: Microscope,
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
