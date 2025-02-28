import express from 'express'
import billRoutes from './routes/bill.routes'

const app = express()
app.use(express.json())

// Mount your routes
app.use('/', billRoutes)

export default app
