import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'

// Define an interface for the nested user payload.
export interface TokenPayload {
	user: {
		_id: string
		name: string
		email: string
		monthlyBudget: number
		currency: string
	}
}

declare global {
	namespace Express {
		// Now req.user will be of type TokenPayload.
		interface Request {
			user?: TokenPayload
		}
	}
}

const protect = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		res.status(401).json({ error: true, message: 'No token provided' })
		return
	}

	try {
		// Decode the token as a TokenPayload (with nested user)
		const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
		req.user = decoded
		next()
	} catch (error: any) {
		res.status(401).json({ error: true, message: error.message })
		return
	}
}

export default protect
