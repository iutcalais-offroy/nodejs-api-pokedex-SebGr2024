import express from 'express'
import {
  createDeck,
  getDecks,
  getDeckById,
  patchDeck,
  deleteDeck,
} from '../controllers/decks.controller'
import { authenticateToken } from '../../auth/middleware/auth.middleware'

const router = express.Router()

/**
 * @route POST api/decks/
 *
 * Récupère un deck
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {CreateDeck} req.body Données du deck à créer
 *
 * @returns {Promise<Response>} Retourne le deck créé avec un statut 201
 */
router.post('/', authenticateToken, createDeck)

/**
 * @route GET api/decks/mine
 *
 * Récupère le deck de l'utilisateur connecté
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 *
 * @returns {Promise<Response>} Retourne le deck créé avec un statut 200
 */
router.get('/mine', authenticateToken, getDecks)

/**
 * @route GET api/decks/:id
 *
 * Récupère le deck avec l'id qu'on à choisi
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {number} req.params.id Id du deck à modifier
 *
 * @returns {Promise<Response>} Retourne le deck créé avec un statut 200
 */
router.get('/:id', authenticateToken, getDeckById)

/**
 * @route PATCH api/decks/:id
 *
 * Modifier le deck avec l'id qu'on à choisi
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {PatchDeck} req.body Données du deck à modifier
 * @param {number} req.params.id Id du deck à modifier
 *
 * @returns {Promise<Response>} Retourne le deck modifier avec un statut 200
 */
router.patch('/:id', authenticateToken, patchDeck)

/**
 * @route DELETE api/decks/:id
 *
 * Supprime le decj avec l'id qu'on à choisi
 *
 * @param {number} req.user.userId Identifiant de l'utilisateur connecté
 * @param {number} req.params.id Id du deck à supprimer
 *
 * @returns {Promise<Response>} Pour nous dire que le deck est supprimer avec un code 200
 */
router.delete('/:id', authenticateToken, deleteDeck)

export default router
