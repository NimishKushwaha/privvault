import { User } from '../entities/User'

declare global {
  namespace Express {
    export interface Request {
      user?: User
    }
  }
}

export {} 