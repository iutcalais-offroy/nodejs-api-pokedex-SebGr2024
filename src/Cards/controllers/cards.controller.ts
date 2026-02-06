import { Request, Response } from "express";
import { prisma } from "./../../database";

export const getCards = async (_req: Request, res: Response) => {
  try {

    const cards = await prisma.card.findMany({
      orderBy: {
        pokedexNumber: "asc"
      },
      select: {
        id: true,
        name: true,
        hp: true,
        attack: true,
        type: true,
        pokedexNumber: true
      }
    })

    return res.status(200).json(cards);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ message: "Erreur serveur" })
  }
}
