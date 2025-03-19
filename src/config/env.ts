import dotenv from 'dotenv'

dotenv.config()

export const PORT = 8080
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''
export const JWT_SECRET =
	process.env.JWT_SECRET || '34r093j4r0jfsd0d9jf0sdjfsdf'
export const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
