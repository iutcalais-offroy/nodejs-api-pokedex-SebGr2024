import * as deckRepository from '../repository/decks.repository'

/**
 * Crée un nouveau deck pour un utilisateur après validation des données.
 *
 * Vérifie :
 * Que l'utilisateur est authentifié
 * Que 10 cartes sont fournies
 * Que les IDs sont valides
 * Que les cartes existent en base
 * Que le nom est valide
 *
 * @param {number | undefined} userId Identifiant de l'utilisateur.
 * @param {string} name Nom du deck.
 * @param {number[]} cards Les cartes.
 *
 * @returns {Promise<Deck>} Le deck créé avec ses cartes.
 *
 * @throws {Object} 401 Si l'utilisateur n'est pas authentifié.
 * @throws {Object} 400 Si les données sont invalides.
 */

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

/**
 * Récupère tous les decks d’un utilisateur avec son id.
 *
 * @param {number} userId Identifiant de l'utilisateur.
 *
 * @returns {Promise<Deck[]>} Liste des decks avec leurs cartes.
 */

export const getDecksByUserId = async (userId: number) => {
  return deckRepository.findDecksByUserId(userId)
}

/**
 * Récupère un deck par son identifiant.
 *
 * @param {number} deckId Identifiant du deck.
 *
 * @returns {Promise<Deck | null>} Le deck correspondant ou null si y en a pas.
 */

export const getDeckById = async (deckId: number) => {
  return deckRepository.findDeckById(deckId)
}

/**
 * Met à jour un deck nom et/ou cartes.
 *
 * Vérifie :
 * Que le deck existe
 * Que c'est bien le deck de l'utilisateur connecté
 * Que les cartes sont valides si elles sont fournies
 *
 * @param {number} deckId Identifiant du deck.
 * @param {number} userId Identifiant de l'utilisateur.
 * @param {string} [name] Nouveau nom du deck si il est changer.
 * @param {number[]} [cards] Nouvelle liste de cartes si elles sont changer.
 *
 * @returns {Promise<Deck | null>} Le deck mis à jour.
 *
 * @throws {Object} 404 Si le deck est introuvable.
 * @throws {Object} 403 Si l'utilisateur na pas accès au deck.
 * @throws {Object} 400 - Si les données sont invalides comme manque des cartes, pas le bon ID.
 */

export const patchDeck = async (
  deckId: number,
  userId: number,
  name?: string,
  cards?: number[],
) => {
  const deck = await deckRepository.findDeckById(deckId)
  if (!deck) {
    throw { statusCode: 404, message: 'Deck introuvable' }
  }

  if (deck.userId !== userId) {
    throw { statusCode: 403, message: 'Accès interdit' }
  }

  if (cards) {
    if (!Array.isArray(cards) || cards.length !== 10) {
      throw { statusCode: 400, message: 'Il faut 10 cartes' }
    }

    if (cards.some((id) => typeof id !== 'number')) {
      throw { statusCode: 400, message: 'Cartes IDs invalide' }
    }

    const existingCards = await deckRepository.findCardsByIds(cards)
    if (existingCards.length !== 10) {
      throw { statusCode: 400, message: 'Une ou plusieurs cartes inexistantes' }
    }

    await deckRepository.deleteDeckCards(deckId)

    await deckRepository.addDeckCards(deckId, cards)
  }

  if (name && name.trim() !== '') {
    await deckRepository.patchDeckName(deckId, name.trim())
  }

  return deckRepository.findDeckById(deckId)
}

/**
 * Supprimer un deck .
 *
 * @param {number} deckId Identifiant du deck.
 * @param {number} userId Identifiant de l'utilisateur.
 *
 * @returns {Promise<void>}
 *
 * @throws {Object} 404 Si le deck n'existe pas car il est introuvable.
 * @throws {Object} 403 Si l'utilisateur na pas accès au deck.
 */

export const deleteDeck = async (deckId: number, userId: number) => {
  const deck = await deckRepository.findDeckById(deckId)

  if (!deck) {
    throw { statusCode: 404, message: 'Deck introuvable' }
  }

  if (deck.userId !== userId) {
    throw { statusCode: 403, message: 'Accès interdit' }
  }

  await deckRepository.deleteDeckCards(deckId)

  await deckRepository.deleteDeck(deckId)
}
