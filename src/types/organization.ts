/**
 * Organization Type Definitions
 * Based on CMMS MVP API Documentation
 */

export type SubscriptionTier = 
    | 'free'
    | 'starter'
    | 'professional'
    | 'enterprise';

export interface OrganizationSettings {
    branding?: {
        primary_color?: string;
        secondary_color?: string;
        company_tagline?: string;
    };
    notifications?: {
        sms_enabled?: boolean;
        push_enabled?: boolean;
        email_enabled?: boolean;
    };
    features?: {
        api_access?: boolean;
        mobile_app?: boolean;
        field_service?: boolean;
        custom_reports?: boolean;
        sla_management?: boolean;
        vendor_management?: boolean;
        compliance_tracking?: boolean;
        inventory_management?: boolean;
    };
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    legal_name?: string;
    tax_id?: string;
    email?: string;
    phone?: string;
    website?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    subscription_tier: SubscriptionTier;
    subscription_expires_at?: string | null;
    subscription_status?: string | null;
    is_active: boolean;
    max_users?: number | null;
    max_assets?: number | null;
    max_work_orders_per_month?: number | null;
    max_storage_gb?: number | null;
    timezone?: string;
    date_format?: string;
    currency?: string;
    logo?: string;
    logo_upload?: string;
    settings?: OrganizationSettings;
    member_count?: number;
    created_at: string;
    updated_at: string;
}

export interface OrganizationMember {
    id: string;
    user: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    role: string;
    is_active: boolean;
    invited_by?: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    } | null;
    created_at: string;
    updated_at?: string;
}

export interface OrganizationMemberListResponse {
    count: number;
    organization_id: string;
    organization_name: string;
    requesting_user: string;
    requesting_user_role: string;
    can_manage_members: boolean;
    results: OrganizationMember[];
}

export interface InviteUserPayload {
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
}

export interface CreateMemberPayload {
    email: string;
    password: string;
    role: string;
    first_name?: string;
    last_name?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
