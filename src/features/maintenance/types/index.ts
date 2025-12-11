export interface MaintenanceJob {
    id: string
    title: string
    description: string
    assetId?: string
    assignedTo?: string
    createdBy?: string
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
    status?: string
    category?: string
    scheduledDate?: string
    dueDate?: string
    completedDate?: string | null
    estimatedHours?: number
    actualHours?: number
    estimatedCost?: number
    site?: string
    location?: string
    progress?: number
    checklistId?: string | null
    attachments?: string[]
    notes?: string
    createdAt?: string
    updatedAt?: string
}
