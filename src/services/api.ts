import axios from 'axios'
import { SecureItem } from '../types/item'
import { encryptData } from '../utils/crypto'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  login: async (email: string, password: string) => {
    console.log('Sending login request:', { email, password })
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { 
      email, 
      password,
      confirmPassword: password 
    })
    return response.data
  },
  validateToken: async () => {
    const response = await api.get('/auth/validate')
    return response.data
  },
}

export const itemsApi = {
  getAll: async (): Promise<SecureItem[]> => {
    const response = await api.get('/items')
    return response.data
  },
  create: async (data: { title: string; content: string; category: string; fileName?: string | null }) => {
    // Only encrypt if it's not already a document
    const content = data.category === 'document' ? 
      data.content : 
      await encryptData(data.content);
      
    const response = await api.post('/items', {
      title: data.title,
      content: content,
      category: data.category,
      fileName: data.fileName || null // Ensure null is sent when fileName is undefined
    });
    return response.data;
  },
  update: async (id: string, data: Partial<{ title: string; content: string; category: string; fileName?: string | null }>) => {
    let requestData = { ...data };
    if (data.content && data.category !== 'document') {
      requestData.content = await encryptData(data.content);
    }
    // Ensure fileName is null when undefined
    if ('fileName' in data && !data.fileName) {
      requestData.fileName = null;
    }
    const response = await api.patch(`/items/${id}`, requestData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/items/${id}`)
  },
}

export default api 