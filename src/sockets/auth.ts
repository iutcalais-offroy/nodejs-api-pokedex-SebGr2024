import { Socket, Server } from 'socket.io'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: number
  email: string
}

export const socketAuth = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Unauthorized: Token manquant'))
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload
      socket.data.userId = payload.userId
      socket.data.email = payload.email
      next()
    } catch {
      return next(new Error('Unauthorized: Token invalide'))
    }
  })
}
