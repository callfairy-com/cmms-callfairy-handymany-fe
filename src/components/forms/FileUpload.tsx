import React, { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { config } from '@/config'

interface FileUploadProps {
    onFileSelect: (file: File) => void
    onFileRemove?: () => void
    accept?: string
    maxSize?: number
    currentFile?: File | null
    preview?: string
    disabled?: boolean
    className?: string
}

export function FileUpload({
    onFileSelect,
    onFileRemove,
    accept = config.files.ALLOWED_TYPES.join(','),
    maxSize = config.files.MAX_SIZE,
    currentFile,
    preview,
    disabled,
    className,
}: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const validateFile = (file: File): boolean => {
        if (file.size > maxSize) {
            setError(`File size must be less than ${config.files.MAX_SIZE_MB}MB`)
            return false
        }
        setError(null)
        return true
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (validateFile(file)) {
                onFileSelect(file)
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (validateFile(file)) {
                onFileSelect(file)
            }
        }
    }

    const handleClick = () => {
        inputRef.current?.click()
    }

    const handleRemove = () => {
        if (inputRef.current) {
            inputRef.current.value = ''
        }
        setError(null)
        onFileRemove?.()
    }

    return (
        <div className={cn('space-y-2', className)}>
            {currentFile || preview ? (
                <div className="relative">
                    {preview && (
                        <div className="relative w-full h-48 border rounded-md overflow-hidden">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center space-x-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {currentFile?.name || 'File uploaded'}
                            </span>
                            {currentFile && (
                                <span className="text-xs text-muted-foreground">
                                    ({(currentFile.size / 1024).toFixed(1)} KB)
                                </span>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        'relative border-2 border-dashed rounded-md p-6 transition-colors',
                        dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                        disabled && 'opacity-50 cursor-not-allowed',
                        className
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Drag and drop your file here, or{' '}
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    disabled={disabled}
                                    className="text-primary hover:underline font-semibold"
                                >
                                    browse
                                </button>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Maximum file size: {config.files.MAX_SIZE_MB}MB
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}
