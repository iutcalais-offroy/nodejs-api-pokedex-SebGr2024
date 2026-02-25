import { prisma } from '../../database'

/**
 * Récupère plusieurs cartes à partir de leurs identifiants.
 *
 * @param {number[]} ids On fait un tableau avec toutes les cartes que l'on cherche par ID.
 *
 * @returns {Promise<Card[]>} On renvoie les cartes choisies.
 */

export const findCardsByIds = async (ids: number[]) => {
  return prisma.card.findMany({
    where: { id: { in: ids } },
  })
}

/**
 * Crée un nouveau deck pour un utilisateur et y mettre des cartes.
 *
 * @param {number} userId Identifiant de l'utilisateur.
 * @param {string} name Nom du deck.
 * @param {number[]} cardIds On fait un tableau avec les cartes et on les associes au deck.
 *
 * @returns {Promise<Deck>}
 */

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

/**
 * Récupère tous les decks appartenant à un utilisateur.
 *
 * @param {number} userId Identifiant de l'utilisateur.
 *
 * @returns {Promise<Deck>}
 */

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

/**
 * Récupère un deck par son identifiant.
 *
 * @param {number} deckId Identifiant du deck.
 *
 * @returns {Promise<Deck>}
 */

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

/**
 * Supprime toutes les cartes pour un deck donné.
 *
 * @param {number} deckId Identifiant du deck.
 *
 * @returns {Promise<Prisma.BatchPayload>}
 */

export const deleteDeckCards = async (deckId: number) => {
  return prisma.deckCard.deleteMany({
    where: { deckId },
  })
}

/**
 * Ajoute de plusieurs cartes à un deck existant.
 *
 * @param {number} deckId Identifiant du deck.
 * @param {number[]} cards Les cartes à ajouter dans le deck.
 * @returns {Promise<Prisma.BatchPayload>}
 */

export const addDeckCards = async (deckId: number, cards: number[]) => {
  return prisma.deckCard.createMany({
    data: cards.map((cardId) => ({ deckId, cardId })),
  })
}

/**
 * Met à jour le nom d’un deck.
 *
 * @param {number} deckId Identifiant du deck.
 * @param {string} name Nouveau nom du deck.
 * @returns {Promise<Deck>}
 */

export const patchDeckName = async (deckId: number, name: string) => {
  return prisma.deck.update({
    where: { id: deckId },
    data: { name },
  })
}

/**
 * Supprime un deck par son identifiant.
 *
 * @param {number} deckId Identifiant du deck.
 * @returns {Promise<Deck>}
 */

export const deleteDeck = async (deckId: number) => {
  return prisma.deck.delete({
    where: { id: deckId },
  })
}
