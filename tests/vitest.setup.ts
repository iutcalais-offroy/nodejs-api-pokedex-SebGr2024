import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { vi, beforeEach } from 'vitest'
import { PrismaClient } from '../src/generated/prisma/client'

export const prismaMock =
  mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

vi.mock('../src/database', () => ({
  prisma: prismaMock,
}))

beforeEach(() => {
  mockReset(prismaMock)
})
