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
/**
 *
 * Vérifie la présence et la validité d’un token JWT dans l’en-tête
 * Authorization de la requête HTTP (format attendu : "Bearer <token>").
 *
 * Si le token est valide :
 * Les informations décodées (userId, email) sont ajoutées à l'objet req.user
 * Le middleware appelle `next()` pour passer au prochain middleware
 *
 * @param {Request} req Objet requête Express contenant les en-têtes HTTP
 * @param {Response} res Objet réponse Express utilisé pour renvoyer une réponse HTTP
 * @param {NextFunction} next Fonction permettant de passer au middleware suivant
 *
 * @returns {void} On ne renvoie rien
 *
 * @throws {JsonWebTokenError} Si le token est invalide avec code 401
 * @throws {TokenExpiredError} Si le token a expiré avec code 401
 *
 */

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
