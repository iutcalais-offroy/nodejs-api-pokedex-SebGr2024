import { createServer } from 'http'
import { env } from './env'
import express from 'express'
import cors from 'cors'
import Routes from './auth/routes/auth.routes'
import RoutesCards from './Cards/routes/cards.route'
import RoutesDecks from './decks/routes/decks.route'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './docs'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

// Create Express app
export const app = express()

// Middlewares
app.use(
  cors({
    origin: true, // Autorise toutes les origines
    credentials: true,
  }),
)

// Documentation Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation',
  }),
)

app.use(express.json())
app.use('/api/auth', Routes)
app.use('/api/cards', RoutesCards)
app.use('/api/decks', RoutesDecks)

// Serve static files (Socket.io test client)
app.use(express.static('public'))

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TCG Backend Server is running' })
})

// Start server only if this file is run directly (not imported for tests)
if (require.main === module) {
  // Create HTTP server
  const httpServer = createServer(app)

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Unauthorized: Token manquant'))

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: number
        email: string
      }
      socket.data.userId = payload.userId
      socket.data.email = payload.email
      next()
    } catch {
      next(new Error('Unauthorized: Token invalide'))
    }
  })

  io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id, 'userId:', socket.data.userId)
  })

  // Start server
  try {
    httpServer.listen(env.PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${env.PORT}`)
      console.log(
        `🧪 Socket.io Test Client available at http://localhost:${env.PORT}`,
      )
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}
