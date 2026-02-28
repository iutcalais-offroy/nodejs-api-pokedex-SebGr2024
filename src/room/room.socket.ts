import { Server, Socket } from 'socket.io'
import { RoomService } from './room.service'

type CreateRoomPayload = {
  deckId: string
}

type JoinRoomPayload = {
  roomId: string
  deckId: string
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('createRoom', async (data: CreateRoomPayload) => {
    try {
      const deckId = Number(data.deckId)

      if (Number.isNaN(deckId)) {
        socket.emit('errorMessage', 'DeckId invalide')
        return
      }

      const room = await RoomService.createRoom(
        socket.data.userId,
        socket.data.email,
        deckId,
      )

      socket.join(`room-${room.id}`)

      socket.emit('roomCreated', room)

      io.emit('roomsListUpdated', RoomService.getAvailableRooms())
    } catch (error) {
      if (error instanceof Error) {
        socket.emit('errorMessage', error.message)
      }
    }
  })

  socket.on('getRooms', () => {
    socket.emit('roomsList', RoomService.getAvailableRooms())
  })

  socket.on('joinRoom', async (data: JoinRoomPayload) => {
    try {
      const roomId = Number(data.roomId)
      const deckId = Number(data.deckId)

      if (Number.isNaN(roomId) || Number.isNaN(deckId)) {
        socket.emit('errorMessage', 'Paramètres invalides')
        return
      }

      const room = await RoomService.joinRoom(
        socket.data.userId,
        socket.data.email,
        roomId,
        deckId,
      )

      socket.join(`room-${room.id}`)

      const gameStateForHost = {
        yourDeckId: room.host.deckId,
        opponentDeckId: room.guest?.deckId,
      }

      const gameStateForGuest = {
        yourDeckId: room.guest?.deckId,
        opponentDeckId: room.host.deckId,
      }

      io.to(`room-${room.id}`).emit('gameStarted', {
        host: gameStateForHost,
        guest: gameStateForGuest,
      })

      io.emit('roomsListUpdated', RoomService.getAvailableRooms())
    } catch (error) {
      if (error instanceof Error) {
        socket.emit('errorMessage', error.message)
      }
    }
  })
}
