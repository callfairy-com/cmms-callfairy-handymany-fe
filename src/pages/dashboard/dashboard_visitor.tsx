import { motion } from 'framer-motion'
import { Building } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useDynamicDashboard } from '@/features/cmms/hooks/useDynamicDashboard'

export const DashboardVisitor: React.FC = () => {
    const { user } = useAuth()
    const { data: dashboardData, isLoading, error } = useDynamicDashboard()

    if (isLoading) {
        return <div className="p-6">Loading dashboard...</div>
    }

    if (error) {
        return <div className="p-6 text-red-600">Error loading dashboard: {error.message}</div>
    }

    if (!dashboardData) {
        return <div className="p-6 text-red-600">Error: No dashboard data available</div>
    }

    const { organization = { name: 'Organization' } } = dashboardData || {}

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-brutal font-bold text-black">VISITOR DASHBOARD</h1>
                    <p className="text-neu-600 mt-1">Welcome, {user?.firstName}! You have read-only access to {organization.name}.</p>
                </div>
            </div>

            {/* Stats Grid - Read Only */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="relative overflow-hidden">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="neu-card p-3">
                                    <Building className="h-6 w-6 text-primary-600" />
                                </div>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-neu-600">Organization</p>
                                <p className="text-2xl font-brutal font-bold text-black">{organization.name}</p>
                                <p className="text-sm text-neu-600">Read Only Mode</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Info Card */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-brutal font-bold text-black mb-4">INFORMATION</h2>
                    <p className="text-neu-600">
                        You currently have visitor-level access. This grants you read-only permissions to view data.
                        Contact your administrator if you need additional access.
                    </p>
                </div>
            </Card>
        </div>
    )
}

