/**
 * API Helper Utilities
 * Common utilities for API interactions following DRY principles
 */

/**
 * Normalize API response to always return an array
 * Handles both paginated and non-paginated responses
 */
export function normalizeToArray<T>(response: any): T[] {
    if (Array.isArray(response)) {
        return response;
    }
    if (response && Array.isArray(response.results)) {
        return response.results;
    }
    if (response && response.data && Array.isArray(response.data)) {
        return response.data;
    }
    return [];
}

/**
 * Extract pagination metadata from API response
 */
export interface PaginationMeta {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    totalPages: number;
}

export function extractPaginationMeta(response: any): PaginationMeta | null {
    if (!response || typeof response !== 'object') {
        return null;
    }

    const count = response.count || 0;
    const next = response.next || null;
    const previous = response.previous || null;

    // Calculate current page from URLs if available
    let currentPage = 1;
    let totalPages = 1;

    if (next) {
        const url = new URL(next);
        const page = url.searchParams.get('page');
        if (page) {
            currentPage = parseInt(page, 10) - 1;
        }
    } else if (previous) {
        const url = new URL(previous);
        const page = url.searchParams.get('page');
        if (page) {
            currentPage = parseInt(page, 10) + 1;
        }
    }

    if (count && response.page_size) {
        totalPages = Math.ceil(count / response.page_size);
    }

    return {
        count,
        next,
        previous,
        currentPage,
        totalPages,
    };
}

/**
 * Build query parameters object from filters
 */
export function buildQueryParams(filters: Record<string, any>): Record<string, any> {
    const params: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
        // Skip null, undefined, and empty strings
        if (value !== null && value !== undefined && value !== '') {
            params[key] = value;
        }
    });

    return params;
}

/**
 * Safe date formatter
 */
export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '—';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString(undefined, options);
    } catch {
        return '—';
    }
}

/**
 * Safe datetime formatter
 */
export function formatDateTime(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '—';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString(undefined, options);
    } catch {
        return '—';
    }
}

/**
 * Safe currency formatter
 */
export function formatCurrency(amount: string | number | null | undefined, currency = 'USD'): string {
    if (amount === null || amount === undefined) return '—';

    try {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
        }).format(numAmount);
    } catch {
        return '—';
    }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate unique key for React lists
 */
export function generateKey(prefix: string, id: string | number, index?: number): string {
    return `${prefix}-${id}${index !== undefined ? `-${index}` : ''}`;
}

/**
 * Handle API errors consistently
 */
export interface ApiError {
    message: string;
    detail?: string;
    errors?: Record<string, string[]>;
    statusCode?: number;
}

export function parseApiError(error: any): ApiError {
    if (!error) {
        return { message: 'An unknown error occurred' };
    }

    // Check for axios-style error
    if (error.response) {
        const { data, status } = error.response;

        return {
            message: data?.message || data?.detail || error.message || 'Request failed',
            detail: data?.detail,
            errors: data?.errors,
            statusCode: status,
        };
    }

    // Check for fetch-style error
    if (error.message) {
        return {
            message: error.message,
        };
    }

    // Fallback
    return {
        message: String(error),
    };
}

/**
 * Retry function for failed API calls
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
            }
        }
    }

    throw lastError;
}
