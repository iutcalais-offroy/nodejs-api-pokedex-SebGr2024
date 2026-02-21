import { prisma } from '../../database'

export const findCardsByIds = async (ids: number[]) => {
  return prisma.card.findMany({
    where: { id: { in: ids } },
  })
}

export const createDeck = async (
  userId: number,
  name: string,
  cardIds: number[],
) => {
  const deck = await prisma.deck.create({
    data: {
      name,
      userId,
    },
  })

  const deckCardsData = cardIds.map((cardId) => ({
    deckId: deck.id,
    cardId,
  }))

  await prisma.deckCard.createMany({
    data: deckCardsData,
  })

  return prisma.deck.findUnique({
    where: { id: deck.id },
    include: {
      cards: {
        include: { card: true },
      },
    },
  })
}

export const findDecksByUserId = async (userId: number) => {
  return prisma.deck.findMany({
    where: { userId },
    include: {
      cards: {
        include: { card: true },
      },
    },
  })
}

export const findDeckById = async (deckId: number) => {
  return prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      cards: {
        include: { card: true },
      },
    },
  })
}

export const deleteDeckCards = async (deckId: number) => {
  return prisma.deckCard.deleteMany({
    where: { deckId },
  })
}

export const addDeckCards = async (deckId: number, cards: number[]) => {
  return prisma.deckCard.createMany({
    data: cards.map((cardId) => ({ deckId, cardId })),
  })
}

export const patchDeckName = async (deckId: number, name: string) => {
  return prisma.deck.update({
    where: { id: deckId },
    data: { name },
  })
}
