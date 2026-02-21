import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../env'

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
        email: string
      }
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as {
      userId: number
      email: string
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    }

    next()
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}
