import { motion } from 'framer-motion'
import { Building, Info, Eye, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useDynamicDashboard } from '@/features/cmms/hooks/useDynamicDashboard'

export const DashboardVisitor: React.FC = () => {
    const { user } = useAuth()
    const { data: dashboardData, isLoading, error, refetch } = useDynamicDashboard()

    const { organization = { name: 'Organization' } } = dashboardData || {}

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="p-8 max-w-md text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
                    <Button onClick={() => refetch()} className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="text-3xl font-brutal font-bold text-foreground">Visitor Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome, {user?.firstName || 'Visitor'}! You have read-only access.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-8">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
                                <Building className="h-8 w-8 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-brutal font-bold text-foreground mb-2">Organization</h2>
                                <p className="text-2xl font-semibold text-foreground">{organization.name}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    You are viewing this organization as a visitor
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-8">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                                <Eye className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-brutal font-bold text-foreground mb-2">Access Level</h2>
                                <p className="text-lg font-semibold text-foreground">Read-Only</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    You can view information but cannot make changes
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-8">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex-shrink-0">
                            <Info className="h-8 w-8 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-brutal font-bold text-foreground mb-4">Information</h2>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    As a visitor, you have limited access to the system. You can view organization information
                                    but cannot create, edit, or delete any data.
                                </p>
                                <p>
                                    If you need additional permissions, please contact your organization administrator.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
