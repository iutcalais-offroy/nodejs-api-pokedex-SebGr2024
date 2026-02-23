import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { authenticateToken } from '../src/auth/middleware/auth.middleware'

interface CustomJwtPayload extends JwtPayload {
  userId: number
  email: string
}

describe('Auth Middleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = { headers: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  it('should return 401 if no token', () => {
    authenticateToken(req as Request, res as Response, next)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('should return 401 if token invalid', () => {
    req.headers = { authorization: 'Bearer fake' }

    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error()
    })

    authenticateToken(req as Request, res as Response, next)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('should call next if token valid', () => {
    req.headers = { authorization: 'Bearer valid' }

    vi.spyOn(jwt, 'verify').mockReturnValue({
      userId: 1,
      email: 'test@test.com',
    } as CustomJwtPayload)

    authenticateToken(req as Request, res as Response, next)
    expect(next).toHaveBeenCalled()
  })
})
