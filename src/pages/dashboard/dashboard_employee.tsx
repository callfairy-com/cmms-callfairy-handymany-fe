import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Calendar, CheckSquare, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useDynamicDashboard } from '@/features/cmms/hooks/useDynamicDashboard'

export const DashboardEmployee: React.FC = () => {
    const navigate = useNavigate()
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

    const { my_tasks, my_tickets, notifications } = dashboardData

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-brutal font-bold text-black">EMPLOYEE DASHBOARD</h1>
                    <p className="text-neu-600 mt-1">Welcome back, {user?.firstName}! View your assigned work.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button onClick={() => navigate('/tasks')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="relative overflow-hidden">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="neu-card p-3">
                                    <Briefcase className="h-6 w-6 text-primary-600" />
                                </div>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-neu-600">Assigned Work Orders</p>
                                <p className="text-2xl font-brutal font-bold text-black">{my_tasks.work_orders_assigned}</p>
                                <p className="text-sm text-neu-500">Open: {my_tasks.work_orders_open}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="relative overflow-hidden">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="neu-card p-3">
                                    <Ticket className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-neu-600">Assigned Tickets</p>
                                <p className="text-2xl font-brutal font-bold text-black">{my_tickets.tickets_assigned}</p>
                                <p className="text-sm text-neu-500">Open: {my_tickets.tickets_open}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="relative overflow-hidden">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="neu-card p-3">
                                    <CheckSquare className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-neu-600">Tasks Due Today</p>
                                <p className="text-2xl font-brutal font-bold text-black">{my_tasks.work_orders_due_today}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card className="h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-brutal font-bold text-black">MY RECENT ACTIVITIES</h2>
                    </div>
                    <div className="space-y-4">
                        {notifications.recent.length > 0 ? (
                            notifications.recent.map((activity: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neu-200 transition-colors"
                                >
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-neu-900">{activity.message || 'New activity'}</p>
                                        <p className="text-xs text-neu-500">{activity.created_at || 'Just now'}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-neu-500">No recent activities.</p>
                        )}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card className="h-fit">
                    <h2 className="text-xl font-brutal font-bold text-black mb-6">QUICK ACTIONS</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Button className="h-20 flex-col" onClick={() => navigate('/tasks')}>
                            <Calendar className="h-6 w-6 mb-2" />
                            VIEW SCHEDULE
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
