import CryptoJS from 'crypto-js'

const DEFAULT_KEY = 'default-encryption-key'

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
    
    // Skip encryption for binary files and already encrypted content
    if (data.startsWith('data:') || 
        data.startsWith('%PDF') || 
        data.startsWith('JVBERi') ||
        data.startsWith('U2FsdGVkX1')) {
      return data;
    }

    // Encrypt text content
    const encrypted = CryptoJS.AES.encrypt(data, DEFAULT_KEY);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // Handle special content types
    if (encryptedData.startsWith('data:')) return encryptedData;
    if (isPdfContent(encryptedData)) {
      return `data:application/pdf;base64,${encryptedData}`;
    }
    if (isBase64(encryptedData)) return encryptedData;

    // Decrypt text content
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, DEFAULT_KEY);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Decryption returned empty result');
      }
      return decryptedText;
    } catch (error) {
      if (isBase64(encryptedData)) return encryptedData;
      throw error;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

// Helper functions
function isPdfContent(str: string): boolean {
  return str.startsWith('JVBERi') || str.startsWith('%PDF');
}

function isBase64(str: string): boolean {
  if (!str) return false;
  
  // Check for common file signatures
  if (str.startsWith('data:')) return true;
  if (str.startsWith('JVBERi0')) return true; // PDF
  if (str.startsWith('/9j/')) return true; // JPEG
  if (str.startsWith('iVBORw0KGgo')) return true; // PNG
  
  try {
    const decoded = atob(str);
    if (decoded.startsWith('%PDF-')) return true;
    const firstBytes = decoded.slice(0, 4);
    return /[\x00-\x1F\x80-\xFF]/.test(firstBytes);
  } catch {
    return false;
  }
}