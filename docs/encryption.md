# AES Encryption in PrivVault

## How AES Works

AES (Advanced Encryption Standard) is a symmetric block cipher that encrypts data in blocks of 128 bits. In PrivVault, we use AES-256-GCM, which means:
- 256: Key length of 256 bits
- GCM: Galois/Counter Mode, providing both authentication and encryption

### Key Components

1. **Key**: 256-bit (32 bytes) encryption key derived from the master key
2. **IV (Initialization Vector)**: 16 bytes of random data
3. **Salt**: 64 bytes of random data for key derivation
4. **Authentication Tag**: 16 bytes for verifying data integrity

### Encryption Process

1. Generate random IV and Salt
2. Derive encryption key using PBKDF2
3. Create cipher with AES-256-GCM
4. Encrypt data and get authentication tag
5. Combine salt + IV + tag + encrypted data
6. Encode in base64

### Example

Let's say you're storing a password "MySecretPassword123":

```typescript
// Original data
const sensitiveData = "MySecretPassword123";
const masterKey = "user's-master-key-generated-at-signup";

// Encryption
const encrypted = encryptData(sensitiveData, masterKey);
// Results in something like:
// "HX7kL9...base64-encoded-string...9d="

// When retrieving:
const decrypted = decryptData(encrypted, masterKey);
// Returns: "MySecretPassword123"
```

### Actual Implementation Flow

```typescript
// Encryption
function encryptData(data: string, masterKey: string): string {
  // 1. Generate random values
  iv = random(16 bytes)      // e.g., "f7c3d9..."
  salt = random(64 bytes)    // e.g., "8a2b4c..."
  
  // 2. Derive encryption key
  key = PBKDF2(masterKey, salt)
  
  // 3. Encrypt
  encrypted = AES_GCM_Encrypt(data, key, iv)
  tag = getAuthTag()
  
  // 4. Combine all components
  final = salt + iv + tag + encrypted
  
  // 5. Encode to base64
  return base64(final)
}
```

## Security Features

1. **Salt**: Prevents rainbow table attacks
2. **IV**: Ensures same data produces different ciphertexts
3. **Authentication Tag**: Prevents tampering
4. **PBKDF2**: Slows down brute-force attacks

## Implementation Notes

- Always use cryptographically secure random number generation
- Never reuse IVs
- Store the master key securely
- Validate decryption before using the data
