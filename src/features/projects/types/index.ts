import type { Client } from '@/features/crm/types'
import type { User } from '@/types/api'

export interface Project {
    id: number
    name: string
    description: string
    client: Client | null
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    start_date: string | null
    end_date: string | null
    budget: number | null
    created_at: string
    updated_at: string
}

export interface Task {
    id: number
    title: string
    description: string
    project: Project | null
    assignee: User | null
    status: 'todo' | 'in_progress' | 'review' | 'done'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    due_date: string | null
    created_at: string
    updated_at: string
}
