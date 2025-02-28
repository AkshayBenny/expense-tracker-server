import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

// Export anything you need in the rest of your code
export const PORT = process.env.PORT || 3000

// For Vision, store your API key in .env as VISION_API_KEY
// e.g. VISION_API_KEY=AIza...
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''
