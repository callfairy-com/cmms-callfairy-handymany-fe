import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { config } from '@/config'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/features/auth/api'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/components/forms/schemas'

export function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setIsLoading(true)
            setError(null)

            await authApi.forgotPassword(data)
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-2">
                            <div className="p-3 rounded-full bg-green-500/10">
                                <KeyRound className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">Check your email</CardTitle>
                        <CardDescription className="text-center">
                            We've sent a password reset link to your email address
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button asChild className="w-full">
                            <Link to={config.routes.LOGIN}>Back to login</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-2">
                        <div className="p-3 rounded-full bg-primary/10">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Forgot your password?</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email')}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Sending...
                                </>
                            ) : (
                                'Send reset link'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Remember your password?{' '}
                        <Link to={config.routes.LOGIN} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
