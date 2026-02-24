import express from 'express'
import { getCards } from '../controllers/cards.controller'

const router = express.Router()

/**
 * @route GET api/cards
 *
 * Récupère les cartes enregistrée
 *
 * @returns {Promise<Response>} Retourne les cartes créé avec un statut 200
 */
router.get('/', getCards)

export default router
