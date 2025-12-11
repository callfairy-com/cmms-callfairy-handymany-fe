import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@/types/components'

export interface DataTableProps<T> {
    data: T[]
    columns: ColumnDef<T>[]
    searchable?: boolean
    searchPlaceholder?: string
    paginated?: boolean
    pageSize?: number
    className?: string
    onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = 'Search...',
    paginated = true,
    pageSize: initialPageSize = 10,
    className,
    onRowClick,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T | null
        direction: 'asc' | 'desc'
    }>({ key: null, direction: 'asc' })

    // Filter data based on search term
    const filteredData = React.useMemo(() => {
        if (!searchTerm) return data

        return data.filter((row) => {
            return Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        })
    }, [data, searchTerm])

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return filteredData

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key!]
            const bValue = b[sortConfig.key!]

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [filteredData, sortConfig])

    // Paginate data
    const paginatedData = React.useMemo(() => {
        if (!paginated) return sortedData

        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return sortedData.slice(startIndex, endIndex)
    }, [sortedData, currentPage, pageSize, paginated])

    const totalPages = Math.ceil(sortedData.length / pageSize)

    const handleSort = (column: ColumnDef<T>) => {
        if (!column.sortable || !column.accessorKey) return

        setSortConfig((prev) => ({
            key: column.accessorKey!,
            direction:
                prev.key === column.accessorKey && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className={cn('space-y-4', className)}>
            {searchable && (
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1) // Reset to first page on search
                            }}
                            className="pl-8"
                        />
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    style={{ width: column.width }}
                                    className={cn(
                                        column.sortable && 'cursor-pointer select-none hover:bg-muted/50'
                                    )}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.header}</span>
                                        {column.sortable && sortConfig.key === column.accessorKey && (
                                            <span className="text-xs">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center h-24">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    className={cn(onRowClick && 'cursor-pointer')}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            {column.cell
                                                ? column.cell(row)
                                                : column.accessorKey
                                                    ? String(row[column.accessorKey])
                                                    : null}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {paginated && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * pageSize + 1} to{' '}
                            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}{' '}
                            results
                        </p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) => {
                                    setPageSize(Number(value))
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>
                            <Button
                                
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
