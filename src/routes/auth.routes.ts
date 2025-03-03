import { Router } from 'express'
import {
	loginController,
	signUpController,
} from '../controllers/auth.controller'
const router = Router()

router.post('/sign-up', signUpController)
router.post('/login', loginController)
export default router
