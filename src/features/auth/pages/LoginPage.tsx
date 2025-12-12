import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth, decodeJWT } from '@/app/providers/AuthProvider'
import { useNotifications } from '@/app/providers/NotificationProvider'
import { config } from '@/config'
import { storage } from '@/lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addNotification } = useNotifications()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        const currentHour = new Date().getHours()
        const greeting =
          currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

        setTimeout(() => {
          addNotification({
            type: 'success',
            title: `${greeting}! Welcome back`,
            message:
              'You have successfully logged in to the CMMS. You have 2 pending work orders and 1 maintenance due today.',
            actionUrl: '/dashboard',
          })
        }, 500)

        // Redirect based on role from JWT
        const access = storage.get<string>(config.storage.AUTH_TOKEN)
        const payload = decodeJWT(access) as any
        const rawRole = payload?.role || null
        const role = rawRole ? String(rawRole).toLowerCase() : null
        let redirectTo = '/dashboard'
        if (role && role.includes('contractor')) redirectTo = '/work-orders'
        navigate(redirectTo)
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">CallFairy CMMS</h1>
                <p className="text-slate-600">Computerized Maintenance Management System</p>
              </div>
            </div>

            <div className="space-y-4 mt-12">
              <h2 className="text-2xl font-bold text-slate-900">Streamline Your Maintenance Operations</h2>
              <p className="text-slate-600 text-lg">
                Comprehensive work order management, asset tracking, and compliance monitoring in one powerful
                platform.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">500+</div>
                  <div className="text-sm text-slate-600">Assets Managed</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
                  <div className="text-sm text-slate-600">Uptime Rate</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-3xl font-bold text-orange-600 mb-1">1,200+</div>
                  <div className="text-sm text-slate-600">Work Orders</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
                  <div className="text-sm text-slate-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CallFairy CMMS</h1>
                <p className="text-xs text-slate-600">Maintenance Management</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-600">Sign in to access your dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Login Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-600 mt-6">
            © 2024 CallFairy CMMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage