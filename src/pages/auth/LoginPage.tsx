import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api'
import { mapLoginResponseToStoreUser } from '@/features/auth/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      const user = mapLoginResponseToStoreUser(response)
      login(user, response.access)
      toast.success(`Welcome back, ${user.firstName}!`)
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neu-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-brutal font-bold text-brutal-gradient mb-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            CRM FAIRY
          </motion.h1>
          <p className="text-neu-600 font-neu">Modern Business Management Platform</p>
        </div>

        <Card className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-brutal font-bold text-foreground mb-2">WELCOME BACK!</h2>
            <p className="text-neu-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neu-500 hover:text-neu-700 transition-colors"
                >
                  {showPassword ?
                    <EyeOff className="h-5 w-5" /> :
                    <Eye className="h-5 w-5" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"


              size="lg"
              className="w-full"
            >
              {isLoading ? 'Signing In...' : 'SIGN IN'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-brutal-yellow border-2 border-black p-3 rounded-lg mb-4">
              <p className="text-xs font-brutal font-bold text-black mb-1">DEMO CREDENTIALS</p>
              <p className="text-xs text-black">Email: demo@crmfairy.com</p>
              <p className="text-xs text-black">Password: demo123</p>
            </div>
            <p className="text-sm text-neu-600">
              Don't have an account?{' '}
              <a href="#" className="font-brutal font-bold text-foreground hover:text-primary-600 transition-colors">
                CONTACT ADMIN
              </a>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-neu-500">
            Powered by CRM Fairy • Built with ❤️ for modern businesses
          </p>
        </div>
      </motion.div>
    </div>
  )
}
