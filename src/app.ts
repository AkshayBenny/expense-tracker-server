// app.ts
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { dbConfig } from './config/mongodb.config'
import billRoutes from './routes/bill.routes'
import authRoutes from './routes/auth.routes'
import budgetRoutes from './routes/budget.routes'
import expenseRoutes from './routes/expense.routes'
import analyticsRoutes from './routes/analytic.routes'
import logger from './config/logger'

const app = express()

mongoose
	.connect(dbConfig.connectionString)
	.then(() => logger.info('Connected to MongoDB'))
	.catch((err) => logger.error(`MongoDB connection error: ${err.message}`))

app.use(express.json())
app.use(cors({ origin: '*' }))

// Middleware to log incoming requests
app.use((req, res, next) => {
	logger.info(`Incoming request: ${req.method} ${req.url} from ${req.ip}`)
	next()
})

// Route handlers
app.use('/', billRoutes)
app.use('/budget', budgetRoutes)
app.use('/expense', expenseRoutes)
app.use('/auth', authRoutes)
app.use('/analytics', analyticsRoutes)

// test
app.get('/test', (req: Request, res: Response) => {
	res.json({ message: 'Test route' })
})

app.get('/health', (req, res) => {
	res.sendStatus(200)
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	logger.error(`Error: ${err.message}`)
	res.status(500).json({ error: true, message: 'Internal Server Error' })
})

export default app
