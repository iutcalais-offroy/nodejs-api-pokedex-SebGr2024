import express from 'express'
import { createDeck } from '../controllers/decks.controller'
import { authenticateToken } from '../../auth/middleware/auth.middleware'

const router = express.Router()

router.post('/', authenticateToken, createDeck)

export default router
