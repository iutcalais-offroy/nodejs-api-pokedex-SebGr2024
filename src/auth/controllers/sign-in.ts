import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './../../database'

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et password sont nécessaire',
      })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        message: 'Email ou incorrect',
      })
    }

    const passwordValide = await bcrypt.compare(password, user.password)

    if (!passwordValide) {
      return res.status(401).json({
        message: 'Mot de passe incorrect',
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    )

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch {
    return res.status(500).json({
      message: 'Erreur serveur',
    })
  }
}
