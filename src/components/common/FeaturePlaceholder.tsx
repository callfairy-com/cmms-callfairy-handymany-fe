/**
 * Feature Placeholder Component
 * Displays a message for features under development
 */

import { LucideIcon, AlertCircle } from 'lucide-react';

interface FeaturePlaceholderProps {
    title: string;
    description: string;
    icons: LucideIcon[];
    features: string[];
}

export function FeaturePlaceholder({ 
    title, 
    description, 
    icons,
    features 
}: FeaturePlaceholderProps) {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                </div>
            </div>

            {/* Placeholder Content */}
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-12 text-center dark:border-amber-700 dark:bg-amber-950/20">
                <div className="flex justify-center gap-4 mb-4">
                    {icons.map((Icon, index) => (
                        <Icon key={index} className="w-16 h-16 text-amber-500" />
                    ))}
                </div>
                
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                            Feature In Development
                        </h3>
                    </div>
                    
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        This feature is currently being developed. API integration will be completed once the backend endpoint is available.
                    </p>
                    
                    <div className="rounded-lg bg-white dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 text-left">
                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-2">
                            Planned Features:
                        </p>
                        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                            {features.map((feature, index) => (
                                <li key={index}>• {feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
