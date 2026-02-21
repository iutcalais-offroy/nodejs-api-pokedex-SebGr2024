import { Request, Response } from 'express'
import * as deckService from '../service/decks.service'

export const createDeck = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    const { name, cards } = req.body

    const deck = await deckService.createDeck(userId, name, cards)

    return res.status(201).json(deck)
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
