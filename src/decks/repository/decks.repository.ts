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
