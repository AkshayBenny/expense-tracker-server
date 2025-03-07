import { Router } from 'express'
import protect from '../middlewares/auth.middleware'
import { addBudgetController } from '../controllers/budget.controller'

const router = Router()

router.post('/budget/add', protect, addBudgetController)

router.post('/budget/add/free', addBudgetController)
