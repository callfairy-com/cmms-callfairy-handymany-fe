import { ReactNode } from 'react'

// Common Component Props
export interface BaseComponentProps {
    className?: string
    children?: ReactNode
}

// Layout Props
export interface LayoutProps extends BaseComponentProps {
    title?: string
}

// Table Column Definition
export interface ColumnDef<T> {
    id: string
    header: string
    accessorKey?: keyof T
    cell?: (row: T) => ReactNode
    sortable?: boolean
    filterable?: boolean
    width?: string | number
}

// Form Field Props
export interface FormFieldProps {
    name: string
    label?: string
    placeholder?: string
    description?: string
    required?: boolean
    disabled?: boolean
    error?: string
}

// Card Props
export interface CardProps extends BaseComponentProps {
    title?: string
    description?: string
    footer?: ReactNode
    headerAction?: ReactNode
}

// Modal Props
export interface ModalProps extends BaseComponentProps {
    open: boolean
    onClose: () => void
    title?: string
    description?: string
    footer?: ReactNode
}

// Button Variant Types
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

// Chart Props
export interface ChartProps {
    data: any[]
    className?: string
    height?: number
    showLegend?: boolean
    showGrid?: boolean
}
