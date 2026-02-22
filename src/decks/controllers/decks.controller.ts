import { Request, Response } from 'express'
import * as deckService from '../service/decks.service'

export const createDeck = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    const { name, cards } = req.body

    const deck = await deckService.createDeck(userId, name, cards)

    return res.status(201).json(deck)
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'message' in error
    ) {
      const erreur = error as { statusCode: number; message: string }
      return res.status(erreur.statusCode).json({ message: erreur.message })
    }

    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const getDecks = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Pas de token' })
    }

    const decks = await deckService.getDecksByUserId(req.user?.userId)

    return res.status(200).json(decks)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const getDeckById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Pas de token' })
    }

    const deckId = Number(req.params.id)

    if (!Number.isInteger(deckId) || deckId <= 0) {
      return res.status(404).json({ message: 'Deck introuvable ID inexistant' })
    }
    const deck = await deckService.getDeckById(deckId)

    if (!deck) {
      return res.status(404).json({ message: 'Deck introuvable' })
    }

    if (deck.userId !== req.user?.userId) {
      return res.status(403).json({ message: 'Accès interdit' })
    }

    return res.status(200).json(deck)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const patchDeck = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Pas de token' })
    }

    const deckId = Number(req.params.id)

    if (!Number.isInteger(deckId) || deckId <= 0) {
      return res.status(404).json({ message: 'ID invalide' })
    }

    const deck = await deckService.getDeckById(deckId)

    if (!deck) {
      return res.status(404).json({ message: 'Deck introuvable' })
    }

    if (deck.userId !== req.user?.userId) {
      return res.status(403).json({ message: 'Accès interdit' })
    }

    const { name, cards } = req.body

    const updatedDeck = await deckService.patchDeck(
      deckId,
      req.user?.userId,
      name,
      cards,
    )

    return res.status(200).json(updatedDeck)
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'message' in error
    ) {
      const erreur = error as { statusCode: number; message: string }
      return res.status(erreur.statusCode).json({ message: erreur.message })
    }

    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const deleteDeck = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Pas de token' })
    }

    const deckId = Number(req.params.id)

    if (!Number.isInteger(deckId) || deckId <= 0) {
      return res.status(404).json({ message: 'ID invalide' })
    }

    await deckService.deleteDeck(deckId, req.user.userId)

    return res.status(200).json({ message: 'Deck supprimé avec succès' })
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'message' in error
    ) {
      const erreur = error as { statusCode: number; message: string }
      return res.status(erreur.statusCode).json({ message: erreur.message })
    }

    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
