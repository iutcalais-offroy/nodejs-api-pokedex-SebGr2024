import { Request, Response } from 'express'
import * as deckService from '../service/decks.service'

/**
 * Crée un deck pour l'utilisateur connecté.
 *
 * @route POST api/decks
 *
 * @async
 * @param {Request } req Requête Express
 * @param {Response} res Réponse Express
 *
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {CreateDeck} req.body Données du deck à créer
 *
 * @returns {Promise<Response>} Retourne le deck créé avec un statut 201
 *
 * @throws {400} Si les données sont invalides
 * @throws {401} Si aucun token n'est fourni
 * @throws {500} On renvoie erreur serveur
 */

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

/**
 *Avoir le deck de l'utilisateur connecté
 *
 * @route GET api/decks/mine
 *
 * @async
 * @param {Request} req Requête Express
 * @param {Response} res Réponse Express
 *
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 *
 * @returns {Promise<Response>} Retourne le deck créé avec un statut 200
 *
 *
 * @throws {401} Si aucun token n'est fourni
 * @throws {500} On renvoie erreur serveur
 */

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

/**
 *Avoir le deck grâce à l'id du deck
 *
 * @route GET api/decks/:id
 *
 * @async
 * @param {Request} req Requête Express
 * @param {Response} res Réponse Express
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {number} req.params.id Id du deck à modifier
 *
 * @returns {Promise<Response>} Retourne le deck créé avec un statut 200
 *
 * @throws {401} Si aucun token n'est fourni
 * @throws {404} Si l'identifiant est invalide ou si le deck est introuvable
 * @throws {403} si on ne peut pas accéder au deck
 * @throws {500} On renvoie erreur serveur
 */

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

/**
 * Mettre à jour les données d'un deck
 *
 * @route PATCH api/decks/:id
 *
 * @async
 * @param {Request} req Requête Express
 * @param {Response} res Réponse Express
 *
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {PatchDeck} req.body Données du deck à modifier
 * @param {number} req.params.id Id du deck à modifier
 *
 * @returns {Promise<Response>} Retourne le deck modifier avec un statut 200
 *
 * @throws {401} Si aucun token n'est fourni
 * @throws {404} Si l'identifiant est invalide ou si le deck est introuvable
 * @throws {403} Si l'accès est interdit pour l'utilisateur
 * @throws {500} On renvoie erreur serveur
 */

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

/**
 * Supprime le deck choisi avec l'id.
 *
 * @route DELETE api/decks/:id
 *
 * @async
 * @param {Request} req Requête Express
 * @param {Response} res Réponse Express
 *
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {number} req.params.id Id du deck à supprimer
 *
 * @returns {Promise<Response>} Pour nous dire que le deck est supprimer avec un code 200
 *
 * @throws {401} Si aucun token n'est fourni
 * @throws {404} Si l'identifiant est invalide
 * @throws {500} On renvoie erreur serveur
 */

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
