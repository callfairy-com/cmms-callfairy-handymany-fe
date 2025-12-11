import { config } from '@/config'
import type { QueryParams } from '@/types/api'

/**
 * Build API endpoint with parameters
 */
export function buildEndpoint(path: string, params?: Record<string, any>): string {
    let url = path

    // Replace path parameters
    if (params) {
        Object.keys(params).forEach((key) => {
            url = url.replace(`:${key}`, String(params[key]))
        })
    }

    return url
}

/**
 * Build query string from params
 */
export function buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', String(params.page))
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize))
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortDirection) searchParams.append('sortDirection', params.sortDirection)
    if (params.search) searchParams.append('search', params.search)

    if (params.filters) {
        params.filters.forEach((filter, index) => {
            searchParams.append(`filters[${index}][field]`, filter.field)
            searchParams.append(`filters[${index}][operator]`, filter.operator)
            searchParams.append(`filters[${index}][value]`, String(filter.value))
        })
    }

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
}

/**
 * Endpoint builder class
 */
export class EndpointBuilder {
    private basePath: string
    private params: Record<string, any> = {}
    private query: QueryParams = {}

    constructor(basePath: string) {
        this.basePath = basePath
    }

    /**
     * Set path parameters
     */
    withParams(params: Record<string, any>): this {
        this.params = { ...this.params, ...params }
        return this
    }

    /**
     * Set query parameters
     */
    withQuery(query: QueryParams): this {
        this.query = { ...this.query, ...query }
        return this
    }

    /**
     * Add pagination
     */
    paginate(page: number, pageSize: number): this {
        this.query.page = page
        this.query.pageSize = pageSize
        return this
    }

    /**
     * Add sorting
     */
    sort(sortBy: string, sortDirection: 'asc' | 'desc' = 'asc'): this {
        this.query.sortBy = sortBy
        this.query.sortDirection = sortDirection
        return this
    }

    /**
     * Add search
     */
    search(searchTerm: string): this {
        this.query.search = searchTerm
        return this
    }

    /**
     * Build the final URL
     */
    build(): string {
        let url = buildEndpoint(this.basePath, this.params)
        const queryString = buildQueryString(this.query)
        return url + queryString
    }

    /**
     * Get full URL with base
     */
    toString(): string {
        return config.api.baseUrl + this.build()
    }
}

/**
 * Create endpoint builder
 */
export function endpoint(basePath: string): EndpointBuilder {
    return new EndpointBuilder(basePath)
}
