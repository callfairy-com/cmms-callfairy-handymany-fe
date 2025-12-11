import { LucideIcon } from 'lucide-react';

interface CardStatProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'slate';
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    value: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    value: 'text-green-600',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    value: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    value: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    value: 'text-purple-600',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    value: 'text-slate-900',
  },
};

export default function CardStat({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'slate',
  onClick,
}: CardStatProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.value}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        )}
      </div>
      
      {(trend || description) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          {trend && (
            <div className="flex items-center space-x-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
