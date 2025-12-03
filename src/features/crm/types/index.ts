export interface ClientCategory {
    id: number
    name: string
    color: string
    created_at: string
    updated_at: string
}

export interface Client {
    id: number
    name: string
    company_name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    country: string
    postal_code: string
    category: ClientCategory | null
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
}

export interface LeadSource {
    id: number
    name: string
    color: string
    created_at: string
    updated_at: string
}

export interface LeadPipeline {
    id: number
    name: string
    description: string
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface LeadStage {
    id: number
    name: string
    color: string
    order: number
    pipeline: LeadPipeline
    created_at: string
    updated_at: string
}

export interface Lead {
    id: number
    title: string
    description: string
    client: Client | null
    source: LeadSource | null
    stage: LeadStage | null
    value: number
    probability: number
    expected_close_date: string | null
    status: 'open' | 'qualified' | 'converted' | 'lost'
    created_at: string
    updated_at: string
}

export interface Deal {
    id: number
    title: string
    description: string
    client: Client
    value: number
    probability: number
    expected_close_date: string | null
    actual_close_date: string | null
    status: 'open' | 'won' | 'lost'
    created_at: string
    updated_at: string
}
