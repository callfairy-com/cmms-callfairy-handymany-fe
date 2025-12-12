import { useAuth } from '@/app/providers/AuthProvider'
import { Navigate } from 'react-router-dom'
import { DashboardSuperadmin } from '../components/DashboardSuperAdmin'
import { DashboardAdmin } from '../components/DashboardOrgAdmin'
import { DashboardManager } from '../components/DashboardManager'
import { DashboardEmployee } from '../components/DashboardEmployee'
import { DashboardVisitor } from '../components/DashboardViewer'
import type { Role } from '@/types/rbac'

/**
 * Role-based Dashboard Router
 * 
 * Automatically renders the appropriate dashboard component based on user role.
 * This provides a single dashboard route that adapts to the authenticated user's permissions.
 */
export function DashboardPage() {
    const { user, isAuthenticated } = useAuth()

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Map user role to dashboard component
    const getDashboardComponent = (role: Role | undefined) => {
        switch (role) {
            case 'superadmin':
                return <DashboardSuperadmin />

            case 'orgadmin':
                return <DashboardAdmin />

            case 'manager':
                return <DashboardManager />

            case 'staff_employee':
                return <DashboardEmployee />

            case 'viewer':
                return <DashboardVisitor />

            default:
                // Fallback to visitor dashboard for unknown roles
                return <DashboardVisitor />
        }
    }

    return getDashboardComponent(user?.role ?? undefined)
}

export default DashboardPage;
