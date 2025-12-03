import { useQuery } from 'react-query'
import { dashboardApi } from '../api'
import type { DynamicDashboardResponse } from '../types'

export const useDynamicDashboard = () => {
    return useQuery<DynamicDashboardResponse, Error>(
        ['dynamicDashboard'],
        () => dashboardApi.getDynamicDashboard(),
        {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    )
}
