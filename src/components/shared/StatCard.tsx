
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon?: React.ReactNode
    change?: number
    changeLabel?: string
    trend?: 'up' | 'down' | 'neutral'
    className?: string
}

export function StatCard({
    title,
    value,
    description,
    icon,
    change,
    changeLabel = 'from last month',
    trend,
    className,
}: StatCardProps) {
    const determinedTrend = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral')

    const TrendIcon = determinedTrend === 'up' ? ArrowUp : determinedTrend === 'down' ? ArrowDown : Minus

    const trendColor =
        determinedTrend === 'up'
            ? 'text-green-600 dark:text-green-400'
            : determinedTrend === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground'

    return (
        <Card className={cn(className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(change !== undefined || description) && (
                    <div className="flex items-center space-x-1 text-xs">
                        {change !== undefined && (
                            <>
                                <TrendIcon className={cn('h-3 w-3', trendColor)} />
                                <span className={cn(trendColor, 'font-medium')}>
                                    {Math.abs(change)}%
                                </span>
                                <span className="text-muted-foreground">{changeLabel}</span>
                            </>
                        )}
                        {!change && description && (
                            <span className="text-muted-foreground">{description}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
