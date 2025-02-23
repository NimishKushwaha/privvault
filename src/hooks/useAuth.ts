import { create } from 'zustand'
import { AuthService } from '../services/auth'
import { initializeEncryptionKey } from '../utils/crypto'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const token = await AuthService.login({ email, password })
      localStorage.setItem('auth_token', token)
      initializeEncryptionKey()
      set({ isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('encryption_key') // Clear encryption key on logout
    set({ isAuthenticated: false, error: null })
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true })
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        set({ isAuthenticated: false, isLoading: false })
        return
      }

      const isValid = await AuthService.validateToken(token)
      if (isValid) {
        initializeEncryptionKey()
      }
      set({ isAuthenticated: isValid, isLoading: false })
    } catch (error: unknown) {
      console.error('Auth check failed:', error)
      set({ isAuthenticated: false, isLoading: false })
    }
  },
})) 