import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { QueryFailedError } from 'typeorm'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors,
    })
  }

  if (err instanceof QueryFailedError) {
    return res.status(400).json({
      status: 'error',
      message: 'Database operation failed',
    })
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  })
} 