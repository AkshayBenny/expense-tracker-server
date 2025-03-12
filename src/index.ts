import app from './app'
import { PORT } from './config/env'
import logger from './config/logger'

app.listen(PORT, () => {
	logger.info(`Server is running on http://localhost:${PORT}`)
})
