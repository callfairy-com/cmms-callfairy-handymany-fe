import { z } from 'zod'
import { VALIDATION_MESSAGES } from './constants'

// Common field validators
export const emailSchema = z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)

export const passwordSchema = z
    .string()
    .min(8, VALIDATION_MESSAGES.INVALID_PASSWORD)

export const phoneSchema = z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, VALIDATION_MESSAGES.INVALID_PHONE)
    .optional()
    .or(z.literal(''))

export const urlSchema = z
    .string()
    .url(VALIDATION_MESSAGES.INVALID_URL)
    .optional()
    .or(z.literal(''))

export const requiredString = (fieldName: string = 'This field') =>
    z.string().min(1, `${fieldName} is required`)

export const optionalString = z.string().optional().or(z.literal(''))

export const numericString = z.string().regex(/^\d+$/, 'Must be a number')

// Common schema patterns
export const paginationSchema = z.object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().default(10),
    total: z.number().int().nonnegative().optional(),
})

export const timestampSchema = z.object({
    createdAt: z.string().datetime().or(z.date()),
    updatedAt: z.string().datetime().or(z.date()),
})

export const idSchema = z.string().or(z.number())

// File upload validation
export const fileSchema = z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
})

export const imageFileSchema = fileSchema.refine(
    (file) => file.type.startsWith('image/'),
    'File must be an image'
)
