import express from 'express'
import {
  createDeck,
  getDecks,
  getDeckById,
  patchDeck,
} from '../controllers/decks.controller'
import { authenticateToken } from '../../auth/middleware/auth.middleware'

const router = express.Router()

router.post('/', authenticateToken, createDeck)
router.get('/mine', authenticateToken, getDecks)
router.get('/:id', authenticateToken, getDeckById)
router.patch('/:id', authenticateToken, patchDeck)

export default router
