# AES Encryption in PrivVault
---

## What is AES?
- Advanced Encryption Standard
- Symmetric encryption algorithm
- Industry standard for secure data storage
- We use AES-256-GCM variant
---

## Key Components in PrivVault
![AES Components](../images/aes-components.png)
- 256-bit Encryption Key
- 16-byte Initialization Vector (IV)
- 64-byte Salt
- 16-byte Authentication Tag
---

## How We Encrypt Your Data
![Encryption Flow](../images/encryption-flow.png)
1. User enters sensitive data
2. System generates random IV & Salt
3. Derives encryption key using master key
4. Encrypts data using AES-256-GCM
5. Stores encrypted data in database
---

## Real Example from PrivVault

```typescript
// Original password
const password = "MyPassword123"

// After encryption
const encrypted = "hK8Jm...base64...2nP="
```

---

## Encryption Process Visualization
```
Original: "MyPassword123"
↓
Add Salt + IV: "random-salt" + "random-iv" + "MyPassword123"
↓
Encrypt with AES: "hK8Jm...encrypted-data...2nP="
↓
Store in Database
```
---

## Decryption Process
![Decryption Flow](../images/decryption-flow.png)
1. Retrieve encrypted data
2. Extract Salt, IV, and Tag
3. Derive same key using master key
4. Authenticate and decrypt
5. Return original data
---

## Security Features
- ✅ Protection against brute force attacks
- ✅ Unique encryption per item
- ✅ Data integrity verification
- ✅ Secure key derivation
---

## Implementation in PrivVault
```typescript
// Encrypting user data
const secureNote = encryptData(
  "My secret note",
  userMasterKey
);

// Decrypting when needed
const originalNote = decryptData(
  secureNote,
  userMasterKey
);
```
---

## Why This Matters
- 🔒 Zero-knowledge encryption
- 🚫 Even we can't read your data
- ⚡ Fast and secure
- 🔑 You control your keys
