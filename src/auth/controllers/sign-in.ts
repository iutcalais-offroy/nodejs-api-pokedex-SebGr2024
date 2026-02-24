import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from './../../database'

/**
 * Se connecter en tant qu'utilisateur
 *
 * @route POST api/auth/sign-in
 *
 * @async
 * @param {Request} req Requête Express
 * @param {Response} res Réponse Express
 *
 *
 * @param {SignIn} req.body Données à rentrer pour se connecter
 *
 * @returns {Promise<Response>} Pour nous dire que l'utilisateur est connecter avec un code 200 avec son token qu'il faudra tout le temps saisir
 *
 * @throws {400} Si aucun email et password n'est saisie
 * @throws {401} Si l'email et le mot de passe est incorrect
 * @throws {500} On renvoie erreur serveur
 */
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
        message: 'Email incorrect',
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
