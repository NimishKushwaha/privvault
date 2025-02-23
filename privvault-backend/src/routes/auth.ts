import { Router } from 'express'
import { validate } from '../middleware/validate'
import { loginSchema, registerSchema } from '../schemas/auth.schema'
import { AppDataSource } from '../config/database'
import { User } from '../entities/User'
import { AppError } from '../middleware/error'
import jwt from 'jsonwebtoken'
import { SignOptions } from 'jsonwebtoken'

const router = Router()
const userRepository = AppDataSource.getRepository(User)

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body

    const existingUser = await userRepository.findOne({ where: { email } })
    if (existingUser) {
      throw new AppError(400, 'Email already registered')
    }

    const user = new User()
    user.email = email
    await user.setPassword(password)
    await userRepository.save(user)

    const signOptions: SignOptions = {
      expiresIn: '24h'
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      signOptions
    )

    res.status(201).json({ token })
  } catch (error) {
    next(error)
  }
})

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await userRepository.findOne({ where: { email } })
    if (!user) {
      throw new AppError(401, 'Invalid credentials')
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      throw new AppError(401, 'Invalid credentials')
    }

    const signOptions: SignOptions = {
      expiresIn: '24h'
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      signOptions
    )

    res.json({ token })
  } catch (error) {
    next(error)
  }
})

router.get('/validate', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new AppError(401, 'No token provided')
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await userRepository.findOne({ where: { id: payload.userId } })

    if (!user) {
      throw new AppError(401, 'Invalid token')
    }

    res.json({ valid: true })
  } catch (error) {
    next(error)
  }
})

export default router