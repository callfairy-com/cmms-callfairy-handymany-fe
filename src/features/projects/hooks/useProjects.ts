import { useState, useEffect } from 'react'
import { projectsApi } from '../api'
import type { Project } from '../types'
import toast from 'react-hot-toast'

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchProjects = async () => {
        setIsLoading(true)
        try {
            const response = await projectsApi.getProjects()
            setProjects(response.results)
            setError(null)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch projects')
            toast.error('Failed to fetch projects')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    return { projects, isLoading, error, refetch: fetchProjects }
}
