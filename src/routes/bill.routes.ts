import { Router } from 'express'
import { processBillController } from '../controllers/bill.controller'
import upload from '../middlewares/upload.middleware'
import protect from '../middlewares/auth.middleware'

const router = Router()

// POST /process-bill
router.post(
	'/process-bill',
	protect,
	upload.single('bill'),
	processBillController
)

export default router
