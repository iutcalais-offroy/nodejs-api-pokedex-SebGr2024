import express from "express";
import { signUp } from "../controllers/sign-up";
import { signIn } from "../controllers/sign-in";
import { authenticateToken } from "../middleware/auth.middleware"; /* Y a rien a protéger pour l'instant mais je l'insére déjà pour préparer le terrain  */



const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
export default router;
