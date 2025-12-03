import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {showHome && (
        <>
          <Link
            to="/dashboard"
            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-slate-900' : 'text-slate-600'}>
                {item.label}
              </span>
            )}
            
            {!isLast && <ChevronRight className="w-4 h-4 text-slate-400" />}
          </div>
        );
      })}
    </nav>
  );
}
