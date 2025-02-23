import { Request, Response, NextFunction, RequestHandler } from 'express'
import { User } from '../entities/User'

export interface AuthenticatedRequest extends Request {
  user: User
}

export type AuthenticatedRequestHandler = RequestHandler<
  any,
  any,
  any,
  any,
  { user: User }
>

export type AuthenticatedMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void 