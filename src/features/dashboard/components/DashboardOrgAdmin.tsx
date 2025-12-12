import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    TrendingUp,
    Briefcase,
    AlertCircle,
    RefreshCw,
    Package,
    Wrench,
    DollarSign,
    CheckCircle,
    XCircle,
    Building2,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { DynamicDashboardData } from '@/types/dashboard';
import { LoadingState, EmptyState } from '@/components/common';
import { formatCurrency, formatDate } from '@/utils';

export const DashboardAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<DynamicDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDashboard = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await dashboardApi.getDynamicDashboard();
            setDashboardData(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (isLoading) {
        return <LoadingState message="Loading dashboard..." />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="p-8 max-w-md text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
                    <Button onClick={fetchDashboard} className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { work_orders, assets, tickets, team, financials, recent_work_orders, recent_tickets, organization } = dashboardData;

    const stats = [
        {
            label: 'Total Work Orders',
            value: work_orders.total,
            subtitle: `${work_orders.open} Open, ${work_orders.in_progress} In Progress`,
            icon: Briefcase,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            onClick: () => navigate('/work-orders'),
        },
        {
            label: 'Total Assets',
            value: assets.total,
            subtitle: `${assets.operational} Operational, ${assets.down} Down`,
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            onClick: () => navigate('/assets'),
        },
        {
            label: 'Total Tickets',
            value: tickets.total,
            subtitle: `${tickets.open} Open, ${tickets.resolved} Resolved`,
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            onClick: () => navigate('/tickets'),
        },
        {
            label: 'Team Members',
            value: team.total_employees,
            subtitle: `${team.departments} Departments`,
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            onClick: () => navigate('/users'),
        },
    ];

    const workOrderStats = [
        {
            label: 'Completed (30d)',
            value: work_orders.completed_last_30_days,
            icon: CheckCircle,
            color: 'text-green-600',
        },
        {
            label: 'Overdue',
            value: work_orders.overdue,
            icon: AlertCircle,
            color: 'text-red-600',
        },
        {
            label: 'Completed Total',
            value: work_orders.completed,
            icon: CheckCircle,
            color: 'text-blue-600',
        },
    ];

    const assetStats = [
        {
            label: 'Operational',
            value: assets.operational,
            icon: CheckCircle,
            color: 'text-green-600',
        },
        {
            label: 'Maintenance',
            value: assets.maintenance,
            icon: Wrench,
            color: 'text-yellow-600',
        },
        {
            label: 'Down',
            value: assets.down,
            icon: XCircle,
            color: 'text-red-600',
        },
    ];

    const quickActions = [
        { label: 'Create Work Order', icon: Briefcase, path: '/work-orders/new' },
        { label: 'Manage Users', icon: Users, path: '/users' },
        { label: 'View Assets', icon: Package, path: '/assets' },
        { label: 'Reports', icon: TrendingUp, path: '/reports' },
        { label: 'Sites', icon: Building2, path: '/sites' },
        { label: 'Settings', icon: Building2, path: '/settings' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Organization Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {dashboardData.user.name}! Managing {organization.name}.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <Button variant="outline" size="sm" onClick={fetchDashboard}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => navigate('/work-orders/new')}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        New Work Order
                    </Button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card
                            key={stat.label}
                            className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                            onClick={stat.onClick}
                        >
                            <div className="flex items-center p-6">
                                <div className="flex-shrink-0">
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Card>
                    )
                })}
            </div>

            {/* Work Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {workOrderStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                </div>
                                <Icon className={`h-8 w-8 ${stat.color}`} />
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {assetStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                </div>
                                <Icon className={`h-8 w-8 ${stat.color}`} />
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Financials */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Expenses (Last 30 Days)</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {formatCurrency(financials.expenses_last_30_days)}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-red-600" />
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Avg Work Order Cost</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {formatCurrency(financials.avg_work_order_cost)}
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Work Orders */}
                <Card className="h-full">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Recent Work Orders</h2>
                            <Button size="sm" variant="ghost" onClick={() => navigate('/work-orders')}>
                                View All
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {recent_work_orders.length > 0 ? (
                                recent_work_orders.slice(0, 5).map((wo) => (
                                    <div
                                        key={wo.id}
                                        className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/work-orders/${wo.id}`)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {wo.work_order_number} - {wo.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {wo.assigned_to?.name || 'Unassigned'} • {formatDate(wo.created_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                wo.priority === 'high' || wo.priority === 'urgent'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    : wo.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            }`}
                                        >
                                            {wo.priority}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={Briefcase} title="No recent work orders" />
                            )}
                        </div>
                    </div>
                </Card>

                {/* Recent Tickets */}
                <Card className="h-full">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Recent Tickets</h2>
                            <Button size="sm" variant="ghost" onClick={() => navigate('/tickets')}>
                                View All
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {recent_tickets.length > 0 ? (
                                recent_tickets.slice(0, 5).map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {ticket.ticket_number} - {ticket.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDate(ticket.created_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                ticket.status === 'resolved'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                    : ticket.status === 'in_progress'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={FileText} title="No recent tickets" />
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Button
                                    key={action.label}
                                    className="h-20 w-full flex-col space-y-2 hover:scale-105 transition-transform"
                                    variant="outline"
                                    onClick={() => navigate(action.path)}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-xs font-semibold">{action.label}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
};
