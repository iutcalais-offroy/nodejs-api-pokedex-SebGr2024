import * as DeckRepository from '../decks/repository/decks.repository'

type Player = {
  userId: number
  username: string
  deckId: number
}

type RoomStatus = 'WAITING' | 'PLAYING'

export type Room = {
  id: number
  host: Player
  guest?: Player
  status: RoomStatus
}

let rooms: Room[] = []
let nextRoomId = 1

export const RoomService = {
  async validateDeck(userId: number, deckId: number) {
    const deck = await DeckRepository.findDeckById(deckId)

    if (!deck) {
      throw new Error('Deck introuvable')
    }

    if (deck.userId !== userId) {
      throw new Error('Ce deck ne vous appartient pas')
    }

    if (!deck.cards || deck.cards.length !== 10) {
      throw new Error('Le deck doit contenir exactement 10 cartes')
    }

    return deck
  },

  async createRoom(
    userId: number,
    username: string,
    deckId: number,
  ): Promise<Room> {
    await this.validateDeck(userId, deckId)

    const newRoom: Room = {
      id: nextRoomId++,
      host: {
        userId,
        username,
        deckId,
      },
      status: 'WAITING',
    }

    rooms.push(newRoom)

    return newRoom
  },

  getAvailableRooms(): Room[] {
    return rooms.filter((room) => room.status === 'WAITING')
  },

  async joinRoom(
    userId: number,
    username: string,
    roomId: number,
    deckId: number,
  ): Promise<Room> {
    const room = rooms.find((r) => r.id === roomId)

    if (!room) {
      throw new Error('Room introuvable')
    }

    if (room.status !== 'WAITING') {
      throw new Error('La room est déjà complète')
    }

    await this.validateDeck(userId, deckId)

    room.guest = {
      userId,
      username,
      deckId,
    }

    room.status = 'PLAYING'

    return room
  },

  removeRoom(roomId: number) {
    rooms = rooms.filter((room) => room.id !== roomId)
  },
}
