import { DollarSign, TrendingUp, Receipt } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function CostTracking() {
    return (
        <FeaturePlaceholder
            title="Cost Tracking"
            description="Track and manage maintenance costs and budgets"
            icons={[DollarSign, TrendingUp, Receipt]}
            features={[
                'Cost categorization',
                'Budget tracking',
                'Expense reports',
                'Cost forecasting',
                'Vendor cost analysis',
                'ROI calculations'
            ]}
        />
    );
}
