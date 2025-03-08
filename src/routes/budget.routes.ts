import { Router } from 'express'
import protect from '../middlewares/auth.middleware'
import { addBudgetController, getUserBudget } from '../controllers/budget.controller'

const router = Router()

router.post('/add', protect, addBudgetController)
router.get('/add', protect, getUserBudget)
router.post('/add/free', addBudgetController)

export default router
