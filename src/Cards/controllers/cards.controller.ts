import { Request, Response } from 'express'
import { prisma } from './../../database'

/**
 *Avoir les cartes enregistrée
 *
 * @route GET api/cards
 *
 * @async
 * @param {Request} _req Requête Express
 * @param {Response} res Réponse Express
 *
 * @returns {Promise<Response>} Retourne les cartes créé avec un statut 200
 *
 * @throws {500} On renvoie erreur serveur
 */

export const getCards = async (_req: Request, res: Response) => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: {
        pokedexNumber: 'asc',
      },
      select: {
        id: true,
        name: true,
        hp: true,
        attack: true,
        type: true,
        pokedexNumber: true,
      },
    })

    return res.status(200).json(cards)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
