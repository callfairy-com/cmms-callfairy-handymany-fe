
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { ChartProps } from '@/types/components'

export interface BarChartProps extends ChartProps {
    dataKey: string
    xAxisKey?: string
    color?: string
    bars?: Array<{
        dataKey: string
        color: string
        name?: string
    }>
}

export function BarChart({
    data,
    dataKey,
    xAxisKey = 'label',
    color = '#8884d8',
    bars,
    className,
    height = 300,
    showLegend = true,
    showGrid = true,
}: BarChartProps) {
    return (
        <div className={cn('w-full', className)}>
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart data={data}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                    <XAxis
                        dataKey={xAxisKey}
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                        }}
                    />
                    {showLegend && <Legend />}
                    {bars ? (
                        bars.map((bar) => (
                            <Bar
                                key={bar.dataKey}
                                dataKey={bar.dataKey}
                                fill={bar.color}
                                name={bar.name}
                                radius={[4, 4, 0, 0]}
                            />
                        ))
                    ) : (
                        <Bar
                            dataKey={dataKey}
                            fill={color}
                            radius={[4, 4, 0, 0]}
                        />
                    )}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    )
}
