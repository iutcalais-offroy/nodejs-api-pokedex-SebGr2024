import * as deckRepository from '../repository/decks.repository'

export const createDeck = async (
  userId: number | undefined,
  name: string,
  cards: number[],
) => {
  if (!userId) {
    throw { statusCode: 401, message: 'Unauthorized' }
  }

  if (!Array.isArray(cards) || cards.length !== 10) {
    throw { statusCode: 400, message: 'Il faut 10 cartes' }
  }

  if (cards.some((id) => typeof id !== 'number')) {
    throw { statusCode: 400, message: 'Cartes IDs invalide' }
  }

  const existingCards = await deckRepository.findCardsByIds(cards)

  if (existingCards.length !== 10) {
    throw { statusCode: 400, message: 'Il y a une carte inexistante' }
  }

  if (!name || name.trim() === '') {
    throw { statusCode: 400, message: 'Il faut le nom' }
  }

  return deckRepository.createDeck(
    userId,
    name,
    existingCards.map((c) => c.id),
  )
}

export const getDecksByUserId = async (userId: number) => {
  return deckRepository.findDecksByUserId(userId)
}

export const getDeckById = async (deckId: number) => {
  return deckRepository.findDeckById(deckId)
}
