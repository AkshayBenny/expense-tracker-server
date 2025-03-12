// config/logger.ts
import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize } = format

// Define the log format
const logFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`
})

// Create the logger instance
const logger = createLogger({
	level: 'info',
	format: combine(
		colorize(), // Colorize log level
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		logFormat
	),
	transports: [
		new transports.Console(),
		// Add a file transport for error logs in production
		new transports.File({ filename: 'logs/error.log', level: 'error' }),
	],
})

// In production, log only errors to the console
if (process.env.NODE_ENV === 'production') {
	logger.clear().add(new transports.Console({ level: 'error' }))
}

export default logger
