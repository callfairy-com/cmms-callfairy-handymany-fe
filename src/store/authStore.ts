import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { config } from '@/config'
import { storage } from '@/lib/utils'
import type { User } from '@/types/api'

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

interface AuthActions {
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    login: (user: User, token: string) => void
    logout: () => void
    updateUser: (updates: Partial<User>) => void
    setLoading: (loading: boolean) => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setToken: (token) => {
                if (token) {
                    storage.set(config.storage.AUTH_TOKEN, token)
                } else {
                    storage.remove(config.storage.AUTH_TOKEN)
                }
                set({ token })
            },

            login: (user, token) => {
                storage.set(config.storage.AUTH_TOKEN, token)
                storage.set(config.storage.USER_DATA, user)
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                })
            },

            logout: () => {
                storage.remove(config.storage.AUTH_TOKEN)
                storage.remove(config.storage.REFRESH_TOKEN)
                storage.remove(config.storage.USER_DATA)
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                })
            },

            updateUser: (updates) =>
                set((state) => {
                    if (!state.user) return state
                    const updatedUser = { ...state.user, ...updates }
                    storage.set(config.storage.USER_DATA, updatedUser)
                    return { user: updatedUser }
                }),

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
