import { Router } from 'express'
import { processBillController } from '../controllers/bill.controller'
import upload from '../middlewares/upload.middleware'

const router = Router()

// POST /process-bill
router.post('/process-bill', upload.single('bill'), processBillController)

export default router
