import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { AppDataSource } from './config/database'
import authRoutes from './routes/auth'
import itemRoutes from './routes/items'

const app = express()

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
}))

// Then add our custom CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    `
      default-src 'self';
      img-src 'self' data: blob: https:;
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      connect-src 'self' http://localhost:3000;
      font-src 'self' data: https:;
      object-src 'self' blob:;
      media-src 'self' data: blob:;
      worker-src 'self' blob:;
      frame-src 'self' blob:;
    `.replace(/\s+/g, ' ').trim()
  )
  next()
})

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Increase payload size limits
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/items', itemRoutes)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status((err as any).status || 500).json({
    message: err.message || 'Internal Server Error'
  });
  next(err); // Call next with the error for other error handlers
});

// Start server
const PORT = process.env.PORT || 3000
AppDataSource.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(error => {
  console.error('Error during Data Source initialization:', error)
}) 