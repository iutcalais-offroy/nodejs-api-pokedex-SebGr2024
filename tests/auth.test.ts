import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prismaMock } from './vitest.setup'
import { signIn } from '../src/auth/controllers/sign-in'
import { signUp } from '../src/auth/controllers/sign-up'

describe('Auth Controller', () => {
  let res: Response

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    vi.clearAllMocks()
  })

  it('should register a new user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    prismaMock.user.create.mockResolvedValue({
      id: 1,
      username: 'test',
      email: 'test@test.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed')

    const req = {
      body: {
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      },
    } as Request

    await signUp(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('should return 409 if email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'test',
      email: 'test@test.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const req = {
      body: {
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      },
    } as Request

    await signUp(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('should login successfully', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'test',
      email: 'test@test.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true)
    vi.spyOn(jwt, 'sign').mockReturnValue('token')

    const req = {
      body: {
        email: 'test@test.com',
        password: 'password',
      },
    } as Request

    await signIn(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should return 401 if user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const req = {
      body: {
        email: 'test@test.com',
        password: 'password',
      },
    } as Request

    await signIn(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('should return 401 if password incorrect', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'test',
      email: 'test@test.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false)

    const req = {
      body: {
        email: 'test@test.com',
        password: 'wrong',
      },
    } as Request

    await signIn(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('should return 500 if prisma throws', async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error())

    const req = {
      body: {
        email: 'test@test.com',
        password: 'password',
      },
    } as Request

    await signIn(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })
  it('should return 400 if email or password missing', async () => {
    const req = { body: { email: 'test@test.com' } } as Request
    await signIn(req, res)
    expect(res.status).toHaveBeenCalledWith(400)

    const req2 = { body: { password: 'password' } } as Request
    await signUp(req2, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
