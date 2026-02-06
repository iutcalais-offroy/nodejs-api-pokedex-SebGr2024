import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma"; // adapte selon ton ORM

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;


    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email déjà utilisé"})
    }


    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {email,username, password: hashedPassword},
        select: {
            email,
            username,
            password: hashedPassword
                
        },
    })

    res.status(201).json({
        message: 'Utilisateur créé',
        user,
    })


    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({error: "Erreur serveur",})
  }

}
