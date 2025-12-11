import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { organizationApi } from '@/features/organization/api/organizationApi';
import type { Organization } from '@/types/organization';

interface OrganizationContextType {
    organization: Organization | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    getLogo: () => string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Default logo fallback
const DEFAULT_LOGO = '/logo.svg';

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganization = async () => {
        const orgId = user?.organization_id;
        if (!orgId) {
            setOrganization(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await organizationApi.getOrganization(orgId);
            setOrganization(data);
        } catch (err: any) {
            console.error('[OrganizationContext] Failed to fetch organization:', err);
            setError(err?.message || 'Failed to load organization');
            setOrganization(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.organization_id) {
            fetchOrganization();
        } else {
            setOrganization(null);
        }
    }, [isAuthenticated, user?.organization_id]);

    // Get the best available logo URL
    const getLogo = (): string | null => {
        if (!organization) return null;
        
        // Prefer logo_upload (uploaded file), then logo (URL), then default
        if (organization.logo_upload) {
            return organization.logo_upload;
        }
        if (organization.logo) {
            return organization.logo;
        }
        return DEFAULT_LOGO;
    };

    const value: OrganizationContextType = {
        organization,
        isLoading,
        error,
        refetch: fetchOrganization,
        getLogo,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}
