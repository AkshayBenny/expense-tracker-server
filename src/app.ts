import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { dbConfig } from './config/mongodb.config'
// routes
import billRoutes from './routes/bill.routes'
import authRoutes from './routes/auth.routes'

// middlewares
import protect from './middlewares/auth.middleware'

const app = express()

mongoose.connect(dbConfig.connectionString)

app.use(express.json())
app.use(
	cors({
		origin: '*',
	})
)

app.use('/', billRoutes)
app.use('/auth', authRoutes)

export default app
