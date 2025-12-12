import { GitBranch, FileEdit, CheckCircle } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function Variations() {
    return (
        <FeaturePlaceholder
            title="Variations Management"
            description="Track and manage project variations and change orders"
            icons={[GitBranch, FileEdit, CheckCircle]}
            features={[
                'Create variation requests',
                'Approval workflows',
                'Cost impact tracking',
                'Variation history',
                'Status tracking',
                'Document attachments'
            ]}
        />
    );
}
