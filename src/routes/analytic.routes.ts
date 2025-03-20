import { Router } from 'express'
import protect from '../middlewares/auth.middleware'
import { getAnalyticsController } from '../controllers/analytics.controller'

const router = Router()

router.get('/', protect, getAnalyticsController)


export default router
