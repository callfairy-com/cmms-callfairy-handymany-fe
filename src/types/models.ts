import { ID, Status } from './index'

// User Model
export interface User {
    id: ID
    email: string
    firstName: string
    lastName: string
    fullName?: string
    avatar?: string
    role: string
    status: Status
    phone?: string
    bio?: string
    createdAt: string
    updatedAt: string
}

// Product Model
export interface Product {
    id: ID
    name: string
    description?: string
    price: number
    sku: string
    category?: string
    inStock: boolean
    quantity: number
    imageUrl?: string
    status: Status
    createdAt: string
    updatedAt: string
}

// Organization Model
export interface Organization {
    id: ID
    name: string
    description?: string
    logo?: string
    website?: string
    industry?: string
    size?: string
    status: Status
    createdAt: string
    updatedAt: string
}

// Activity Log Model
export interface ActivityLog {
    id: ID
    userId: ID
    action: string
    entity: string
    entityId: ID
    description: string
    metadata?: Record<string, any>
    createdAt: string
}

// Notification Model
export interface Notification {
    id: ID
    userId: ID
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    link?: string
    createdAt: string
}

// Dashboard Stats Model
export interface DashboardStats {
    totalUsers: number
    totalProducts: number
    totalRevenue: number
    activeUsers: number
    usersChange: number
    productsChange: number
    revenueChange: number
    activeUsersChange: number
}

// Chart Data Model
export interface ChartData {
    label: string
    value: number
    date?: string
    category?: string
}
