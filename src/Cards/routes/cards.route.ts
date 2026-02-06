import { Router } from "express";
import { getCards } from "../controllers/cards.controller";

const router = Router();

router.get("/cards", getCards);

export default router;
