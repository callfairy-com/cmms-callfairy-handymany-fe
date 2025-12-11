import type { ApiUser, User, LoginResponse } from '../types'
import { toRole } from '@/lib/permissions'

/**
 * Map backend login response to Store user (camelCase)
 */
export function mapLoginResponseToStoreUser(response: LoginResponse): User {
    const roleString = response.organizations[0]?.role || 'viewer';

    return {
        id: response.id,
        email: response.email,
        firstName: response.name.split(' ')[0] || response.name,
        lastName: response.name.split(' ').slice(1).join(' ') || '',
        role: toRole(roleString), // Type-safe with validation
        status: 'active',
        createdAt: response.date_joined,
        updatedAt: response.date_joined,
    }
}

/**
 * Map API user (snake_case) to Store user (camelCase)
 */
export function mapApiUserToStoreUser(apiUser: ApiUser): User {
    return {
        id: apiUser.id,
        email: apiUser.email,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        role: apiUser.role,
        status: 'active', // Default as API doesn't return it
        createdAt: new Date().toISOString(), // Default
        updatedAt: new Date().toISOString(), // Default
    }
}
