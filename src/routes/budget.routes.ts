import { Router } from 'express'
import protect from '../middlewares/auth.middleware'
import {
	addBudgetController,
	getUserBudget,
	updateBudgetController,
} from '../controllers/budget.controller'

const router = Router()

router.post('/add', protect, addBudgetController)
router.put('/update/:budgetId', protect, updateBudgetController)
router.get('/', protect, getUserBudget)

export default router
