import { Calendar, Users } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function Attendance() {
    return (
        <FeaturePlaceholder
            title="Attendance Management"
            description="Track contractor and employee attendance"
            icons={[Calendar, Users]}
            features={[
                'Clock in/out tracking',
                'Time sheet management',
                'Overtime calculations',
                'Attendance reports',
                'Leave management'
            ]}
        />
    );
}
