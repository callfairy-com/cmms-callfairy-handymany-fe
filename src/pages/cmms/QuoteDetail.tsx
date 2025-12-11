import { FileText, Eye, Edit } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function QuoteDetail() {
    return (
        <FeaturePlaceholder
            title="Quote Details"
            description="View and manage quote details"
            icons={[FileText, Eye, Edit]}
            features={[
                'Quote overview',
                'Line items breakdown',
                'Client information',
                'Quote history',
                'Status updates',
                'PDF generation'
            ]}
        />
    );
}
