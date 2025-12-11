/**
 * Reusable Status Badge Component
 * Following DRY principles for consistent status display across the app
 */

import type { WorkOrderStatus, WorkOrderPriority } from '@/types/workOrder';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

const statusColorMap: Record<string, string> = {
    // Work Order Statuses
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    assigned: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',

    // Priorities
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    emergency: 'bg-red-500 text-white',

    // Asset Statuses
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    retired: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',

    // Generic Statuses
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase().replace(/ /g, '_');
    const colorClass = statusColorMap[normalizedStatus] || 'bg-gray-100 text-gray-700';
    const sizeClass = sizeClasses[size];

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium capitalize ${colorClass} ${sizeClass}`}
        >
            {status.replace(/_/g, ' ')}
        </span>
    );
}

/**
 * Priority Badge Component
 */
interface PriorityBadgeProps {
    priority: WorkOrderPriority;
    size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
    return <StatusBadge status={priority} size={size} />;
}

/**
 * Work Order Status Badge Component
 */
interface WorkOrderStatusBadgeProps {
    status: WorkOrderStatus;
    size?: 'sm' | 'md' | 'lg';
}

export function WorkOrderStatusBadge({ status, size = 'sm' }: WorkOrderStatusBadgeProps) {
    return <StatusBadge status={status} size={size} />;
}
