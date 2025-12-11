
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
    name: string
    label?: string
    placeholder?: string
    description?: string
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox'
    options?: { label: string; value: string }[]
    value?: any
    onChange?: (value: any) => void
    onBlur?: () => void
    error?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

export function FormField({
    name,
    label,
    placeholder,
    description,
    type = 'text',
    options = [],
    value,
    onChange,
    onBlur,
    error,
    required,
    disabled,
    className,
}: FormFieldProps) {
    const inputId = `field-${name}`

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <Textarea
                        id={inputId}
                        name={name}
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={(e) => onChange?.(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={cn(error && 'border-destructive')}
                    />
                )

            case 'select':
                return (
                    <Select
                        value={value || ''}
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={cn(error && 'border-destructive')}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={inputId}
                            checked={value || false}
                            onCheckedChange={onChange}
                            disabled={disabled}
                        />
                        {label && (
                            <label
                                htmlFor={inputId}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {label}
                                {required && <span className="text-destructive ml-1">*</span>}
                            </label>
                        )}
                    </div>
                )

            default:
                return (
                    <Input
                        id={inputId}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={(e) => {
                            const inputValue = type === 'number' ? parseFloat(e.target.value) : e.target.value
                            onChange?.(inputValue)
                        }}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={cn(error && 'border-destructive')}
                    />
                )
        }
    }

    if (type === 'checkbox') {
        return (
            <div className={cn('space-y-2', className)}>
                {renderInput()}
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor={inputId}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            {renderInput()}
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}
