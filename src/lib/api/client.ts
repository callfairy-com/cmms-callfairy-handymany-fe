import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { config } from '@/config'
import { storage } from '../utils'
import type { ApiError } from '@/types/api'

class ApiClient {
    private client: AxiosInstance
    private refreshTokenPromise: Promise<string> | null = null

    constructor() {
        this.client = axios.create({
            baseURL: config.api.baseUrl,
            timeout: config.api.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        this.setupInterceptors()
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (axiosConfig) => {
                const token = storage.get<string>(config.storage.AUTH_TOKEN)
                if (token) {
                    axiosConfig.headers.Authorization = `Bearer ${token}`
                }
                return axiosConfig
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

                // Handle 401 errors (unauthorized)
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    try {
                        // Try to refresh the token
                        const newToken = await this.refreshToken()
                        if (newToken && originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`
                            return this.client(originalRequest)
                        }
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        this.handleAuthError()
                        return Promise.reject(refreshError)
                    }
                }

                // Transform error to ApiError format
                return Promise.reject(this.transformError(error))
            }
        )
    }

    private async refreshToken(): Promise<string | null> {
        // Prevent multiple simultaneous refresh requests
        if (this.refreshTokenPromise) {
            return this.refreshTokenPromise
        }

        this.refreshTokenPromise = (async () => {
            try {
                const refreshToken = storage.get<string>(config.storage.REFRESH_TOKEN)
                if (!refreshToken) {
                    throw new Error('No refresh token available')
                }

                const response = await axios.post(
                    `${config.api.baseUrl}${config.api.endpoints.AUTH.REFRESH}`,
                    { refreshToken }
                )

                const { token } = response.data
                storage.set(config.storage.AUTH_TOKEN, token)
                return token
            } finally {
                this.refreshTokenPromise = null
            }
        })()

        return this.refreshTokenPromise
    }

    private handleAuthError(): void {
        storage.remove(config.storage.AUTH_TOKEN)
        storage.remove(config.storage.REFRESH_TOKEN)
        storage.remove(config.storage.USER_DATA)
        window.location.href = config.routes.LOGIN
    }

    private transformError(error: AxiosError): ApiError {
        const apiError: ApiError = {
            message: 'An unexpected error occurred',
            status: error.response?.status || 500,
        }

        if (error.response?.data) {
            const data = error.response.data as any
            apiError.message = data.message || data.error || apiError.message
            apiError.errors = data.errors
            apiError.code = data.code
        } else if (error.message) {
            apiError.message = error.message
        }

        return apiError
    }

    // HTTP Methods
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config)
        return response.data
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config)
        return response.data
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config)
        return response.data
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config)
        return response.data
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config)
        return response.data
    }

    // Upload file with progress
    async upload<T = any>(
        url: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<T> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await this.client.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress(progress)
                }
            },
        })

        return response.data
    }

    // Get the axios instance for advanced usage
    getInstance(): AxiosInstance {
        return this.client
    }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
