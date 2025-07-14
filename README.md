# PrivVault

PrivVault is a secure personal data manager built with React, TypeScript, Material UI, and a Node.js/Express/PostgreSQL backend. It allows users to store passwords, secure notes, and documents with encryption and authentication.

## Features

- User authentication (JWT-based)
- Store passwords, notes, and documents securely
- AES encryption for sensitive data
- File upload (documents/images, up to 50MB)
- Responsive Material UI design
- PostgreSQL database with TypeORM
- Rate limiting, CORS, and security headers

## Folder Structure

```
privvault/
  ├── src/                # Frontend (React, TypeScript)
  ├── privvault-backend/  # Backend (Node.js, Express, TypeScript)
  ├── index.html          # Main HTML entry
  ├── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database

### Backend Setup

1. Copy `.env` from `privvault-backend/.env` and update DB credentials as needed.
2. Install dependencies:
   ```
   cd privvault-backend
   npm install
   ```
3. Initialize the database and create an admin user:
   ```
   npm run init-db
   ```
   Or create an admin manually:
   ```
   npm run create-admin
   ```
4. Start the backend server:
   ```
   npm run dev
   ```
   The backend runs on `http://localhost:3000`.

### Frontend Setup

1. Install dependencies:
   ```
   cd ..
   npm install
   ```
2. Start the frontend:
   ```
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

## Default Admin Credentials

- Email: `admin@privvault.com`
- Password: `admin123`

## Usage

- Login with the admin credentials.
- Add new secure items (passwords, notes, documents).
- Upload files (PDF, images, etc.) up to 50MB.
- Edit and delete items.
- All sensitive data is encrypted before storage.

## Security Notes

- All API requests require JWT authentication.
- Data is encrypted client-side before sending to the backend.
- Backend uses rate limiting, helmet, and CSP headers for security.
- Passwords are hashed using bcrypt.

## Development

- Frontend: React + TypeScript + Material UI
- Backend: Express + TypeScript + TypeORM + PostgreSQL

##
