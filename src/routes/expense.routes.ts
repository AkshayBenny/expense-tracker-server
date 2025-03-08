import { Router } from 'express'
import protect from '../middlewares/auth.middleware'
import { addManualExpenseController } from '../controllers/expense.controller'

const router = Router()

router.post('/add', protect, addManualExpenseController)

export default router
