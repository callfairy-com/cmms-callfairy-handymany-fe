// Asset Management Types

export type AssetType = 'equipment' | 'vehicle' | 'tool' | 'facility' | 'infrastructure' | 'other';
export type AssetStatus = 'operational' | 'maintenance' | 'down' | 'retired' | 'disposed' | 'reserved';
export type AssetCriticality = 'low' | 'medium' | 'high' | 'critical';
export type MeterType = 'runtime_hours' | 'mileage' | 'cycles' | 'production_count' | 'other';
export type DocumentType = 'manual' | 'warranty' | 'invoice' | 'certificate' | 'photo' | 'other';
export type AssignmentType = 'user' | 'team' | 'site' | 'department';
export type CustodyType = 'assigned' | 'temporary' | 'permanent';

export interface AssetCategory {
    id: string;
    organization: string;
    name: string;
    code?: string;
    description?: string;
    parent?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Asset {
    id: string;
    organization: string;
    category?: string;
    category_name?: string;
    name: string;
    asset_type: AssetType;
    site?: string;
    site_name?: string;
    building?: string;
    floor?: string;
    location_details?: string;
    status: AssetStatus;
    criticality: AssetCriticality;
    manufacturer?: string;
    model_number?: string;
    serial_number?: string;
    barcode?: string;
    qr_code?: string;
    image?: string;
    purchase_date?: string;
    purchase_cost?: number;
    current_value?: number;
    warranty_start_date?: string;
    warranty_end_date?: string;
    installation_date?: string;
    commission_date?: string;
    expected_useful_life_years?: number;
    description?: string;
    specifications?: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
}

export interface AssetMeter {
    id: string;
    organization: string;
    asset: string;
    asset_name?: string;
    meter_type: MeterType;
    name: string;
    unit_of_measure: string;
    current_reading: number;
    reading_frequency?: string;
    last_reading_date?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AssetMeterReading {
    id: string;
    meter: string;
    reading: number;
    reading_date: string;
    recorded_by?: string;
    notes?: string;
    created_at: string;
}

export interface AssetDocument {
    id: string;
    organization: string;
    asset: string;
    asset_name?: string;
    title: string;
    document: string;
    document_type: DocumentType;
    description?: string;
    uploaded_by?: string;
    uploaded_at: string;
    file_size?: number;
    file_type?: string;
}

export interface AssetAssignment {
    id: string;
    organization: string;
    asset: string;
    asset_name?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    assigned_team?: string;
    assignment_type: AssignmentType;
    assigned_date: string;
    expected_return_date?: string;
    actual_return_date?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
}

export interface AssetCustody {
    id: string;
    organization: string;
    asset: string;
    asset_name?: string;
    custodian: string;
    custodian_name?: string;
    custody_type: CustodyType;
    start_date: string;
    end_date?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
}

export interface AssetCheckLog {
    id: string;
    organization: string;
    asset: string;
    asset_name?: string;
    checked_out_to?: string;
    checked_out_by?: string;
    checked_out_at?: string;
    checked_in_by?: string;
    checked_in_at?: string;
    notes?: string;
    created_at: string;
}

export interface AssetTransfer {
    id: string;
    organization: string;
    asset: string;
    asset_name?: string;
    from_site?: string;
    from_site_name?: string;
    to_site?: string;
    to_site_name?: string;
    from_building?: string;
    to_building?: string;
    transfer_date: string;
    transferred_by?: string;
    notes?: string;
    created_at: string;
}

export interface AssetPart {
    id: string;
    organization: string;
    asset: string;
    asset_name?: string;
    part: string;
    part_name?: string;
    quantity_required: number;
    notes?: string;
    created_at: string;
}

export interface AssetStats {
    total_assets: number;
    by_status: Record<AssetStatus, number>;
    by_type: Record<AssetType, number>;
    by_criticality: Record<AssetCriticality, number>;
    total_value: number;
    maintenance_due: number;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Form payloads
export interface CreateAssetPayload {
    organization: string;
    category?: string;
    name: string;
    asset_type: AssetType;
    site?: string;
    building?: string;
    floor?: string;
    location_details?: string;
    status: AssetStatus;
    criticality: AssetCriticality;
    manufacturer?: string;
    model_number?: string;
    serial_number?: string;
    barcode?: string;
    purchase_date?: string;
    purchase_cost?: number;
    warranty_start_date?: string;
    warranty_end_date?: string;
    installation_date?: string;
    description?: string;
    specifications?: Record<string, any>;
}

export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {}

export interface CreateAssetCategoryPayload {
    organization: string;
    name: string;
    code?: string;
    description?: string;
    parent?: string | null;
    is_active?: boolean;
}

export interface CreateAssetMeterPayload {
    organization: string;
    asset: string;
    meter_type: MeterType;
    name: string;
    unit_of_measure: string;
    current_reading?: number;
    reading_frequency?: string;
    is_active?: boolean;
}

export interface RecordMeterReadingPayload {
    reading: number;
    notes?: string;
}

export interface TransferAssetPayload {
    site?: string;
    building?: string;
    floor?: string;
    notes?: string;
}

export interface CheckOutAssetPayload {
    organization: string;
    asset: string;
    checked_out_to: string;
    notes?: string;
}

export interface CheckInAssetPayload {
    organization: string;
    asset: string;
    notes?: string;
}
