import { Router } from 'express'
import {
	processBillController,
	updateBillController,
	getBillsController,
} from '../controllers/bill.controller'
import upload from '../middlewares/upload.middleware'
import protect from '../middlewares/auth.middleware'

const router = Router()

router.get('/bills', protect, getBillsController)

router.post(
	'/process-bill',
	protect,
	upload.single('bill'),
	processBillController
)

router.put('/edit/:billId', protect, updateBillController)

export default router
