import express from "express";
import { signUp } from "../controllers/sign-up";
import { signIn } from "../controllers/sign-in";



const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
export default router;
