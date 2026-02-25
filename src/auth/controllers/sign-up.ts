import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './../../database'

/**
 * S'inscrire (se crée un compte) en tant qu'utilisateur
 *
 * @route POST api/auth/sign-up
 *
 * @async
 * @param {Request} req Requête Express
 * @param {Response} res Réponse Express
 *
 *
 * @param {SignUp} req.body Données à rentrer pour se crée un compte
 *
 * @returns {Promise<Response>} Pour nous dire que l'utilisateur est crée avec un code 201 avec son token qu'il faudra tout le temps saisir
 *
 * @throws {400} Si aucun email, mot de passe et username n'est saisie
 * @throws {409} Si l'email est déjà utilisé
 * @throws {500} On renvoie erreur serveur
 */

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({
        message: 'Email, username et password sont nécessaire',
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email déjà utilisé',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
      select: {
        email: true,
        username: true,
        password: true,
      },
    })

    res.status(201).json({
      message: 'Utilisateur créé',
      user,
    })

    const token = jwt.sign(
      { userUsername: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    )

    return res.status(201).json({
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    })
  } catch {
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
