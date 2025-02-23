import { Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/database'
import { User } from '../entities/User'
import { AuthenticatedRequest, AuthenticatedMiddleware } from '../types/custom'

export const authenticateToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOneBy({ id: payload.userId })

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    (req as AuthenticatedRequest).user = user
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' })
  }
} 