import { authApi } from './api'

interface Credentials {
  email: string
  password: string
}

// For development only - replace with actual user database
const MOCK_USERS = [
  {
    email: 'admin@privvault.com',
    // In reality, this would be a properly hashed password
    password: 'f749aa0f65832d8c3bdfb3faf7c8a420', // "admin123" hashed
  },
]

export class AuthService {
  static async login(credentials: { email: string; password: string }): Promise<string> {
    try {
      const { token } = await authApi.login(credentials.email, credentials.password)
      localStorage.setItem('auth_token', token) // Store token
      return token
    } catch (error) {
      console.error('Login error:', error) // Debug log
      throw new Error('Invalid credentials')
    }
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      const { valid } = await authApi.validateToken()
      return valid
    } catch {
      return false
    }
  }
} 