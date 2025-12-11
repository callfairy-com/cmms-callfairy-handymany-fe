import { LucideIcon } from 'lucide-react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  dot?: boolean;
  onClick?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  secondary: 'bg-purple-100 text-purple-700 border-purple-200',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-500',
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  secondary: 'bg-purple-500',
};

export default function StatusBadge({
  label,
  variant = 'default',
  size = 'md',
  icon: Icon,
  dot = false,
  onClick,
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center space-x-1.5 font-medium rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
      `}
      onClick={onClick}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </span>
  );
}

// Helper function to get variant based on status
export function getStatusVariant(status: string): BadgeVariant {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('complete') || statusLower.includes('approved') || statusLower.includes('accepted') || statusLower.includes('operational')) {
    return 'success';
  }
  if (statusLower.includes('pending') || statusLower.includes('scheduled')) {
    return 'warning';
  }
  if (statusLower.includes('urgent') || statusLower.includes('overdue') || statusLower.includes('rejected') || statusLower.includes('critical')) {
    return 'danger';
  }
  if (statusLower.includes('progress') || statusLower.includes('active')) {
    return 'info';
  }
  
  return 'default';
}
