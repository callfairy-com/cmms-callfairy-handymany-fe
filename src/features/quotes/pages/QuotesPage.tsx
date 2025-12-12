import { FileText, DollarSign, Send } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function Quotes() {
    return (
        <FeaturePlaceholder
            title="Quotes Management"
            description="Create, manage, and track quotes"
            icons={[FileText, DollarSign, Send]}
            features={[
                'Quote creation and editing',
                'Template management',
                'Quote versioning',
                'Client communication',
                'Quote approval workflow',
                'Conversion to work orders'
            ]}
        />
    );
}
