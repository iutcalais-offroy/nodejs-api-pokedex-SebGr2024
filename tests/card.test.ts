import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'
import { prismaMock } from './vitest.setup'
import { getCards } from '../src/Cards/controllers/cards.controller'

describe('Cards Controller', () => {
  let res: Response

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    vi.clearAllMocks()
  })

  it('should return cards ordered by pokedexNumber', async () => {
    prismaMock.card.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Bulbasaur',
        hp: 45,
        attack: 49,
        type: 'Grass',
        pokedexNumber: 1,
      },
    ])

    await getCards({} as Request, res)

    expect(prismaMock.card.findMany).toHaveBeenCalledWith({
      orderBy: { pokedexNumber: 'asc' },
      select: {
        id: true,
        name: true,
        hp: true,
        attack: true,
        type: true,
        pokedexNumber: true,
      },
    })

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should return 500 if prisma throws', async () => {
    prismaMock.card.findMany.mockRejectedValue(new Error('DB error'))

    await getCards({} as Request, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })
})
