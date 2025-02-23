export interface SecureItem {
  id: string
  title: string
  encryptedContent: string
  category: string
  createdAt: string
  updatedAt: string
  fileName: string | null
  content?: string // Add this optional field for decrypted content
} 