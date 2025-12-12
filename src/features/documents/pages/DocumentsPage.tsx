import { FileText, Upload, FolderOpen } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function Documents() {
    return (
        <FeaturePlaceholder
            title="Document Management"
            description="Centralized document storage and management"
            icons={[FileText, FolderOpen, Upload]}
            features={[
                'Document upload and storage',
                'Version control',
                'Document categorization',
                'Search and filters',
                'Access control',
                'Document sharing'
            ]}
        />
    );
}
