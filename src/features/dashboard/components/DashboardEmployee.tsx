import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, CheckSquare, Ticket, Clock, AlertCircle, RefreshCw, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/app/providers/AuthProvider'
import { useDynamicDashboard } from '@/features/cmms/hooks/useDynamicDashboard'

const StatCardSkeleton = () => (
    <Card className="relative overflow-hidden">
        <div className="flex items-center animate-pulse">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="ml-4 flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
        </div>
    </Card>
)

export const DashboardEmployee: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: dashboardData, isLoading, error, refetch } = useDynamicDashboard()

    const {
        my_tasks = { work_orders_assigned: 0, work_orders_open: 0, work_orders_in_progress: 0, work_orders_due_today: 0, work_orders_overdue: 0 },
        my_tickets = { tickets_assigned: 0, tickets_open: 0 },
        notifications = { unread_count: 0, recent: [] },
        attendance = { checked_in_today: false, check_in_time: null }
    } = dashboardData || {}

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
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

    const stats = [
        {
            label: 'My Work Orders',
            value: my_tasks.work_orders_assigned,
            subtitle: `In Progress: ${my_tasks.work_orders_in_progress}`,
            icon: Briefcase,
            color: 'text-primary-600',
            bgColor: 'bg-primary-100 dark:bg-primary-900/20',
            delay: 0
        },
        {
            label: 'My Tickets',
            value: my_tickets.tickets_assigned,
            subtitle: `Open: ${my_tickets.tickets_open}`,
            icon: Ticket,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            delay: 0.1
        },
        {
            label: 'Due Today',
            value: my_tasks.work_orders_due_today,
            subtitle: my_tasks.work_orders_overdue > 0 ? `Overdue: ${my_tasks.work_orders_overdue}` : 'On track',
            icon: CheckSquare,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            delay: 0.2
        },
        {
            label: 'Attendance',
            value: attendance.checked_in_today ? 'Checked In' : 'Not Checked In',
            subtitle: attendance.check_in_time || '--',
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            delay: 0.3
        }
    ]

    const quickActions = [
        { label: 'My Work Orders', icon: ClipboardList, path: '/work-orders' },
        { label: 'My Tickets', icon: Ticket, path: '/tickets' },
        { label: 'Check In/Out', icon: Clock, path: '/attendance' },
        { label: 'My Tasks', icon: CheckSquare, path: '/tasks' }
    ]

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="text-3xl font-brutal font-bold text-foreground">My Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.firstName || 'Employee'}! Here's your work overview.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: stat.delay }}
                        >
                            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="flex items-center p-6">
                                    <div className="flex-shrink-0">
                                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                            <Icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-brutal font-bold text-foreground mt-1">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="h-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-brutal font-bold text-foreground">Recent Activities</h2>
                                <Button size="sm" variant="ghost">View All</Button>
                            </div>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {notifications.recent.length > 0 ? (
                                        notifications.recent.slice(0, 5).map((activity: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {activity.message || 'New activity'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.created_at || 'Just now'}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground text-sm">No recent activities</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="h-full">
                        <div className="p-6">
                            <h2 className="text-xl font-brutal font-bold text-foreground mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon
                                    return (
                                        <motion.div
                                            key={action.label}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                        >
                                            <Button
                                                className="h-24 w-full flex-col space-y-2 hover:scale-105 transition-transform"
                                                variant="outline"
                                                onClick={() => navigate(action.path)}
                                            >
                                                <Icon className="h-6 w-6" />
                                                <span className="text-xs font-semibold">{action.label}</span>
                                            </Button>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
