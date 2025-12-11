import { useState, useEffect } from 'react'
import { crmApi } from '../api'
import type { Client } from '../types'
import toast from 'react-hot-toast'

export function useClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchClients = async () => {
        setIsLoading(true)
        try {
            const response = await crmApi.getClients()
            setClients(response.results)
            setError(null)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch clients')
            toast.error('Failed to fetch clients')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    return { clients, isLoading, error, refetch: fetchClients }
}
