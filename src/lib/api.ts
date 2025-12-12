import { apiClient } from './api/client'

// Re-export feature APIs
export * from '@/features/auth/api'
export * from '@/features/auth/types'
export * from '@/features/crm/api'
export * from '@/features/crm/types'
export * from '@/features/projects/api'
export * from '@/features/projects/types'
export * from '@/features/maintenance/services/maintenanceApi'
export * from '@/features/maintenance/types'

// Export the axios instance as 'api' for backward compatibility
export const api = apiClient.getInstance()
export default api
