import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY_NAME = 'encryption_key';
const DEFAULT_KEY = 'default-encryption-key'; // Fallback key for development

export async function hashPassword(password: string): Promise<string> {
  const salt = CryptoJS.lib.WordArray.random(128 / 8)
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  })
  return key.toString(CryptoJS.enc.Base64)
}

export function initializeEncryptionKey(): void {
  return; // No-op since we're using DEFAULT_KEY
}

export async function encryptData(data: string): Promise<string> {
  try {
    console.log('Encrypting data:', typeof data);
    const encryptionKey = DEFAULT_KEY;
    
    // Skip encryption if it's already a data URL
    if (data.startsWith('data:')) {
      return data;
    }

    // Check if the data is already encrypted (starts with "U2FsdGVkX1")
    if (data.startsWith('U2FsdGVkX1')) {
      console.log('Data appears to be already encrypted, skipping encryption');
      return data;
    }

    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(data, encryptionKey);
    const encryptedString = encrypted.toString();
    
    return encryptedString;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export async function decryptData(encryptedData: string): Promise<string> {
  try {
    console.log('Decrypting data:', typeof encryptedData);
    const encryptionKey = DEFAULT_KEY;

    // Skip decryption for data URLs
    if (encryptedData.startsWith('data:')) {
      return encryptedData;
    }

    // For base64 encoded content (PDFs, images, etc.)
    if (isBase64(encryptedData)) {
      console.log('Content appears to be base64 encoded, skipping decryption');
      return encryptedData;
    }

    // Try to decrypt
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Decryption returned empty result');
      }

      return decryptedText;
    } catch (decryptError) {
      // If decryption fails and content looks like base64, return as-is
      if (isBase64(encryptedData)) {
        return encryptedData;
      }
      throw decryptError;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    // If it's base64 content that failed decryption, return as-is
    if (isBase64(encryptedData)) {
      return encryptedData;
    }
    throw new Error(error instanceof Error ? error.message : 'Decryption failed');
  }
}

// Helper function to check if a string is base64 encoded
function isBase64(str: string): boolean {
  if (!str) return false;
  
  // Check for common base64 patterns
  if (str.startsWith('data:')) return true;
  if (str.startsWith('JVBERi0')) return true; // PDF
  if (str.startsWith('/9j/')) return true; // JPEG
  if (str.startsWith('iVBORw0KGgo')) return true; // PNG
  
  try {
    // Try to decode and check if it's valid base64
    const decoded = atob(str);
    // Check if it starts with PDF signature
    if (decoded.startsWith('%PDF-')) return true;
    // Check for other binary file signatures
    const firstBytes = decoded.slice(0, 4);
    return /[\x00-\x1F\x80-\xFF]/.test(firstBytes);
  } catch {
    return false;
  }
} 