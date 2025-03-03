import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 3000
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''
export const JWT_SECRET =
	process.env.JWT_SECRET || '34r093j4r0jfsd0d9jf0sdjfsdf'
