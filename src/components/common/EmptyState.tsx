/**
 * Reusable Empty State Component
 * Following DRY principles for consistent empty states across the app
 */

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <Icon className="w-12 h-12 text-slate-400 mx-auto mb-3 dark:text-slate-600" />
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

/**
 * Loading State Component
 */
interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}

/**
 * Error State Component
 */
interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorState({ title = 'Error', message, onRetry }: ErrorStateProps) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-12 text-center dark:border-red-900 dark:bg-red-950">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-red-600 dark:text-red-400">!</span>
            </div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100">{title}</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
