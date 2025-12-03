
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { ChartProps } from '@/types/components'

export interface LineChartProps extends ChartProps {
    dataKey?: string
    xAxisKey?: string
    color?: string
    lines?: Array<{
        dataKey: string
        color: string
        name?: string
    }>
}

export function LineChart({
    data,
    dataKey,
    xAxisKey = 'label',
    color = '#8884d8',
    lines,
    className,
    height = 300,
    showLegend = true,
    showGrid = true,
}: LineChartProps) {
    return (
        <div className={cn('w-full', className)}>
            <ResponsiveContainer width="100%" height={height}>
                <RechartsLineChart data={data}>
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
                    {lines ? (
                        lines.map((line) => (
                            <Line
                                key={line.dataKey}
                                type="monotone"
                                dataKey={line.dataKey}
                                stroke={line.color}
                                name={line.name}
                                strokeWidth={2}
                                dot={{ fill: line.color }}
                            />
                        ))
                    ) : (
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ fill: color }}
                        />
                    )}
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    )
}
