import express from 'express'
import { createDeck, getDecks } from '../controllers/decks.controller'
import { authenticateToken } from '../../auth/middleware/auth.middleware'

const router = express.Router()

router.post('/', authenticateToken, createDeck)
router.get('/mine', authenticateToken, getDecks)

export default router
