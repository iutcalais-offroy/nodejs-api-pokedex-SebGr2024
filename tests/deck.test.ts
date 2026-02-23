import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from './vitest.setup'
import * as deckService from '../src/decks/service/decks.service'
import * as deckRepository from '../src/decks/repository/decks.repository'
import type { Deck, Card } from '../src/generated/prisma'

describe('Deck Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return cards by ids', async () => {
    const cards: Card[] = [
      {
        id: 1,
        name: 'Test',
        hp: 50,
        attack: 50,
        type: 'Fire',
        pokedexNumber: 1,
        imgUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    prismaMock.card.findMany.mockResolvedValue(cards)

    const result = await deckRepository.findCardsByIds([1])
    expect(result).toEqual(cards)
    expect(prismaMock.card.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1] } },
    })
  })

  it('should create a deck with cards and return full deck', async () => {
    const deck: Deck = {
      id: 1,
      name: 'Deck',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const cards = [{ id: 1 }, { id: 2 }]

    prismaMock.deck.create.mockResolvedValue(deck)
    prismaMock.deckCard.createMany.mockResolvedValue({ count: 2 })
    prismaMock.deck.findUnique.mockResolvedValue({
      ...deck,
      cards: cards.map((id) => ({ card: { id } })),
    } as Array)

    const result = await deckRepository.createDeck(1, 'Deck', [1, 2])
    expect(result?.id).toBe(deck.id)
    expect(prismaMock.deck.create).toHaveBeenCalled()
    expect(prismaMock.deckCard.createMany).toHaveBeenCalled()
    expect(prismaMock.deck.findUnique).toHaveBeenCalled()
  })

  it('should return decks by userId', async () => {
    const decks: Deck[] = [
      {
        id: 1,
        name: 'Deck',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    prismaMock.deck.findMany.mockResolvedValue(decks)

    const result = await deckRepository.findDecksByUserId(1)
    expect(result).toEqual(decks)
    expect(prismaMock.deck.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      include: { cards: { include: { card: true } } },
    })
  })

  it('should return deck by id', async () => {
    const deck: Deck = {
      id: 1,
      name: 'Deck',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    prismaMock.deck.findUnique.mockResolvedValue(deck)

    const result = await deckRepository.findDeckById(1)
    expect(result).toEqual(deck)
    expect(prismaMock.deck.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { cards: { include: { card: true } } },
    })
  })

  it('should return null if deck not found', async () => {
    prismaMock.deck.findUnique.mockResolvedValue(null)
    const result = await deckRepository.findDeckById(999)
    expect(result).toBeNull()
  })

  it('should delete deck cards', async () => {
    prismaMock.deckCard.deleteMany.mockResolvedValue({ count: 2 })
    const result = await deckRepository.deleteDeckCards(1)
    expect(result).toEqual({ count: 2 })
    expect(prismaMock.deckCard.deleteMany).toHaveBeenCalledWith({
      where: { deckId: 1 },
    })
  })

  it('should add deck cards', async () => {
    prismaMock.deckCard.createMany.mockResolvedValue({ count: 2 })
    const result = await deckRepository.addDeckCards(1, [1, 2])
    expect(result).toEqual({ count: 2 })
    expect(prismaMock.deckCard.createMany).toHaveBeenCalledWith({
      data: [
        { deckId: 1, cardId: 1 },
        { deckId: 1, cardId: 2 },
      ],
    })
  })

  it('should update deck name', async () => {
    prismaMock.deck.update.mockResolvedValue({ id: 1, name: 'Updated' } as Deck)
    const result = await deckRepository.patchDeckName(1, 'Updated')
    expect(result.name).toBe('Updated')
    expect(prismaMock.deck.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated' },
    })
  })

  it('should delete deck', async () => {
    prismaMock.deck.delete.mockResolvedValue({ id: 1 } as Deck)
    const result = await deckRepository.deleteDeck(1)
    expect(result.id).toBe(1)
    expect(prismaMock.deck.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })
})

describe('Deck Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw 401 if userId is missing', async () => {
    await expect(
      deckService.createDeck(undefined, 'Deck', Array(10).fill(1)),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should throw 400 if cards are not exactly 10', async () => {
    await expect(
      deckService.createDeck(1, 'Deck', [1, 2, 3]),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should throw 400 if cards contain non-number', async () => {
    await expect(
      deckService.createDeck(1, 'Deck', [1, 2, '3', 4, 5, 6, 7, 8, 9, 10]),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should throw 400 if some cards do not exist', async () => {
    vi.spyOn(deckRepository, 'findCardsByIds').mockResolvedValue([{ id: 1 }])
    await expect(
      deckService.createDeck(1, 'Deck', Array(10).fill(1)),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should throw 400 if name is empty', async () => {
    vi.spyOn(deckRepository, 'findCardsByIds').mockResolvedValue(
      Array(10).fill({ id: 1 }),
    )
    await expect(
      deckService.createDeck(1, '', Array(10).fill(1)),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should create deck successfully', async () => {
    const cards = Array(10).fill({ id: 1 })
    vi.spyOn(deckRepository, 'findCardsByIds').mockResolvedValue(cards)
    vi.spyOn(deckRepository, 'createDeck').mockResolvedValue({
      id: 1,
      name: 'Deck',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Deck)

    const result = await deckService.createDeck(1, 'Deck', Array(10).fill(1))
    expect(result.name).toBe('Deck')
    expect(deckRepository.createDeck).toHaveBeenCalled()
  })

  it('should return decks by userId', async () => {
    const decks: Deck[] = [
      {
        id: 1,
        name: 'Deck',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    vi.spyOn(deckRepository, 'findDecksByUserId').mockResolvedValue(decks)
    const result = await deckService.getDecksByUserId(1)
    expect(result).toEqual(decks)
  })

  it('should return deck by id', async () => {
    const deck: Deck = {
      id: 1,
      name: 'Deck',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue(deck)
    const result = await deckService.getDeckById(1)
    expect(result).toEqual(deck)
  })

  it('should return null if deck not found', async () => {
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue(null)
    const result = await deckService.getDeckById(999)
    expect(result).toBeNull()
  })

  it('should throw 404 if deck not found', async () => {
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue(null)
    await expect(deckService.patchDeck(1, 1)).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('should throw 403 if deck not owned by user', async () => {
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue({
      id: 1,
      userId: 2,
    } as Deck)
    await expect(deckService.patchDeck(1, 1)).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('should patch deck name successfully', async () => {
    const deck: Deck = {
      id: 1,
      name: 'Deck',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue(deck)
    vi.spyOn(deckRepository, 'patchDeckName').mockResolvedValue({
      ...deck,
      name: 'Updated',
    } as Deck)
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue({
      ...deck,
      name: 'Updated',
    } as Deck)

    const result = await deckService.patchDeck(1, 1, 'Updated')
    expect(result?.name).toBe('Updated')
    expect(deckRepository.patchDeckName).toHaveBeenCalled()
  })

  it('should patch deck cards successfully', async () => {
    const deck: Deck = {
      id: 1,
      name: 'Deck',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const cards = Array(10).fill({ id: 1 })
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue(deck)
    vi.spyOn(deckRepository, 'findCardsByIds').mockResolvedValue(cards)
    vi.spyOn(deckRepository, 'deleteDeckCards').mockResolvedValue({ count: 10 })
    vi.spyOn(deckRepository, 'addDeckCards').mockResolvedValue({ count: 10 })
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue(deck)

    await deckService.patchDeck(1, 1, undefined, Array(10).fill(1))
    expect(deckRepository.deleteDeckCards).toHaveBeenCalled()
    expect(deckRepository.addDeckCards).toHaveBeenCalled()
  })

  it('should throw 404 if deck not found', async () => {
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue(null)
    await expect(deckService.deleteDeck(1, 1)).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('should throw 403 if deleting deck not owned by user', async () => {
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue({
      id: 1,
      userId: 2,
    } as Deck)
    await expect(deckService.deleteDeck(1, 1)).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('should delete deck successfully', async () => {
    vi.spyOn(deckRepository, 'findDeckById').mockResolvedValue({
      id: 1,
      userId: 1,
    } as Deck)
    vi.spyOn(deckRepository, 'deleteDeckCards').mockResolvedValue({ count: 10 })
    vi.spyOn(deckRepository, 'deleteDeck').mockResolvedValue({ id: 1 } as Deck)

    await deckService.deleteDeck(1, 1)
    expect(deckRepository.deleteDeckCards).toHaveBeenCalled()
    expect(deckRepository.deleteDeck).toHaveBeenCalled()
  })
})
