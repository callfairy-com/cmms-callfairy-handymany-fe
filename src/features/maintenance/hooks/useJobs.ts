import { useState, useEffect } from 'react'
import { maintenanceApi } from '../api'
import type { MaintenanceJob } from '../types'
import toast from 'react-hot-toast'

export function useJobs() {
    const [jobs, setJobs] = useState<MaintenanceJob[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const response = await maintenanceApi.getJobs()
            setJobs(response.results)
            setError(null)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch jobs')
            toast.error('Failed to fetch jobs')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    return { jobs, isLoading, error, refetch: fetchJobs }
}
