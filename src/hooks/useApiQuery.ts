import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { parseApiError } from '@/utils/apiHelpers';

/**
 * Custom hook for API queries with loading, error, and retry states
 * Follows DRY and SOLID principles for reusable API data fetching
 */

export interface UseApiQueryOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    showErrorToast?: boolean;
    autoFetch?: boolean;
    dependencies?: any[];
}

export interface UseApiQueryResult<T> {
    data: T | null;
    loading: boolean;
    error: any;
    refetch: () => Promise<void>;
    reset: () => void;
}

export function useApiQuery<T>(
    queryFn: () => Promise<T>,
    options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
    const {
        onSuccess,
        onError,
        showErrorToast = true,
        autoFetch = true,
        dependencies = [],
    } = options;

    const { showToast } = useNotifications();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await queryFn();
            setData(result);
            onSuccess?.(result);
        } catch (err: any) {
            setError(err);
            const apiError = parseApiError(err);

            if (showErrorToast) {
                showToast('error', 'Request Failed', apiError.message);
            }

            onError?.(err);
        } finally {
            setLoading(false);
        }
    }, [queryFn, onSuccess, onError, showErrorToast, showToast]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [...dependencies, autoFetch]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        reset,
    };
}

/**
 * Custom hook for API mutations (POST, PUT, DELETE)
 */

export interface UseMutationOptions<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
}

export interface UseMutationResult<TData, TVariables> {
    mutate: (variables: TVariables) => Promise<TData | null>;
    data: TData | null;
    loading: boolean;
    error: any;
    reset: () => void;
}

export function useMutation<TData = any, TVariables = any>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
    const {
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Operation successful',
    } = options;

    const { showToast } = useNotifications();
    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = useCallback(
        async (variables: TVariables): Promise<TData | null> => {
            setLoading(true);
            setError(null);

            try {
                const result = await mutationFn(variables);
                setData(result);

                if (showSuccessToast) {
                    showToast('success', 'Success', successMessage);
                }

                onSuccess?.(result, variables);
                return result;
            } catch (err: any) {
                setError(err);
                const apiError = parseApiError(err);

                if (showErrorToast) {
                    showToast('error', 'Operation Failed', apiError.message);
                }

                onError?.(err, variables);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [mutationFn, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, showToast]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        mutate,
        data,
        loading,
        error,
        reset,
    };
}
