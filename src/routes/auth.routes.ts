import { Router } from 'express'
import {
	forgotPasswordController,
	loginController,
	resetPasswordController,
	signUpController,
} from '../controllers/auth.controller'
const router = Router()

router.post('/sign-up', signUpController)
router.post('/login', loginController)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)

export default router
