/**
 * Location Hierarchy Type Definitions
 * Based on CMMS MVP API Documentation
 */

// Site
export interface Site {
    id: string;
    organization: string;
    name: string;
    code?: string;
    description?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    site_type?: string;
    timezone?: string;
    size_sqft?: number;
    total_area?: number;
    manager?: string | { id: string; name: string; email: string };
    contact_email?: string;
    contact_phone?: string;
    tags?: string[];
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    created_by?: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
}

export interface SiteStatistics {
    total_buildings: number;
    total_assets: number;
    total_work_orders: number;
    open_work_orders: number;
    overdue_work_orders: number;
}

// Building
export interface Building {
    id: string;
    name: string;
    code?: string;
    description?: string;
    site: {
        id: string;
        name: string;
    };
    floor_count?: number;
    total_area_sqft?: number;
    year_built?: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    organization: string;
}

// Floor
export interface Floor {
    id: string;
    name: string;
    floor_number: number;
    building: {
        id: string;
        name: string;
    };
    area_sqft?: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    organization: string;
}

// Zone
export interface Zone {
    id: string;
    name: string;
    zone_type?: string;
    building?: {
        id: string;
        name: string;
    };
    floor?: {
        id: string;
        name: string;
    };
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    organization: string;
}

// API Payloads
export interface CreateSitePayload {
    organization: string;
    name: string;
    code?: string;
    description?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    site_type?: string;
    timezone?: string;
    size_sqft?: number;
    total_area?: number;
    manager?: string;
    contact_email?: string;
    contact_phone?: string;
    tags?: string[];
    is_active?: boolean;
}

export interface UpdateSitePayload {
    organization?: string;
    name?: string;
    code?: string;
    description?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    site_type?: string;
    timezone?: string;
    size_sqft?: number;
    total_area?: number;
    manager?: string;
    contact_email?: string;
    contact_phone?: string;
    tags?: string[];
    is_active?: boolean;
}

export interface PartialUpdateSitePayload {
    name?: string;
    code?: string;
    description?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    site_type?: string;
    timezone?: string;
    size_sqft?: number;
    total_area?: number;
    manager?: string;
    contact_email?: string;
    contact_phone?: string;
    tags?: string[];
    is_active?: boolean;
}

export interface CreateBuildingPayload {
    name: string;
    code?: string;
    description?: string;
    site: string;
    floor_count?: number;
    total_area_sqft?: number;
    year_built?: number;
    is_active?: boolean;
}

export interface UpdateBuildingPayload {
    name?: string;
    code?: string;
    description?: string;
    site?: string;
    floor_count?: number;
    total_area_sqft?: number;
    year_built?: number;
    is_active?: boolean;
}

export interface CreateFloorPayload {
    name: string;
    floor_number: number;
    building: string;
    area_sqft?: number;
    is_active?: boolean;
}

export interface UpdateFloorPayload {
    name?: string;
    floor_number?: number;
    building?: string;
    area_sqft?: number;
    is_active?: boolean;
}

export interface CreateZonePayload {
    name: string;
    zone_type?: string;
    building?: string;
    floor?: string;
    description?: string;
    is_active?: boolean;
}

export interface UpdateZonePayload {
    name?: string;
    zone_type?: string;
    building?: string;
    floor?: string;
    description?: string;
    is_active?: boolean;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
