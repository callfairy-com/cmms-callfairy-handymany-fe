import { z } from 'zod'
import { emailSchema, passwordSchema, phoneSchema, requiredString, optionalString } from '@/lib/validators'
import { config } from '@/config'

// Login Schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, config.validation.REQUIRED),
    remember: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register Schema
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, config.validation.REQUIRED),
    firstName: requiredString('First name'),
    lastName: requiredString('Last name'),
}).refine((data) => data.password === data.confirmPassword, {
    message: config.validation.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset Password Schema
export const resetPasswordSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, config.validation.REQUIRED),
}).refine((data) => data.password === data.confirmPassword, {
    message: config.validation.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// User Form Schema
export const userFormSchema = z.object({
    email: emailSchema,
    firstName: requiredString('First name'),
    lastName: requiredString('Last name'),
    role: requiredString('Role'),
    status: requiredString('Status'),
    phone: phoneSchema,
    bio: optionalString,
})

export type UserFormData = z.infer<typeof userFormSchema>

// Product Form Schema
export const productFormSchema = z.object({
    name: requiredString('Product name'),
    description: optionalString,
    price: z.number().min(0, 'Price must be positive'),
    sku: requiredString('SKU'),
    category: requiredString('Category'),
    quantity: z.number().int().min(0, 'Quantity must be positive'),
    inStock: z.boolean(),
    status: requiredString('Status'),
})

export type ProductFormData = z.infer<typeof productFormSchema>

// Profile Update Schema
export const profileUpdateSchema = z.object({
    firstName: requiredString('First name'),
    lastName: requiredString('Last name'),
    phone: phoneSchema,
    bio: optionalString,
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// Change Password Schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, config.validation.REQUIRED),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, config.validation.REQUIRED),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: config.validation.PASSWORDS_DONT_MATCH,
    path: ['confirmNewPassword'],
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
