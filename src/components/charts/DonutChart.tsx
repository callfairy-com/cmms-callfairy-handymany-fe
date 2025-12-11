
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'
import { ChartProps } from '@/types/components'

export interface DonutChartProps extends ChartProps {
    dataKey: string
    nameKey?: string
    colors?: string[]
    innerRadius?: number
    outerRadius?: number
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function DonutChart({
    data,
    dataKey,
    nameKey = 'name',
    colors = DEFAULT_COLORS,
    className,
    height = 300,
    showLegend = true,
    innerRadius = 60,
    outerRadius = 80,
}: DonutChartProps) {
    return (
        <div className={cn('w-full', className)}>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        label
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                        }}
                    />
                    {showLegend && <Legend />}
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
