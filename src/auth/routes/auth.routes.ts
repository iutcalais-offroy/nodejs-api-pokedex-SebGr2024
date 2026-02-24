import express from 'express'
import { signUp } from '../controllers/sign-up'
import { signIn } from '../controllers/sign-in'

const router = express.Router()
/**
 * @route POST api/auth/sign-up
 *
 * S'inscrire (se crée un compte) en tant qu'utilisateur
 *
 * @param {SignUp} req.body Données à rentrer pour se crée un compte
 *
 * @returns {Promise<Response>} Pour nous dire que l'utilisateur est crée avec un code 201 avec son token qu'il faudra tout le temps saisir
 */

router.post('/sign-up', signUp)

/**
 * @route POST api/auth/sign-in
 *
 * Se connecter en tant qu'utilisateur
 *
 * @param {SignIn} req.body Données à rentrer pour se connecter
 *
 * @returns {Promise<Response>} Pour nous dire que l'utilisateur est connecter avec un code 200 avec son token qu'il faudra tout le temps saisir
 */
router.post('/sign-in', signIn)
export default router
