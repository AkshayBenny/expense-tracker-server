import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'
import { User } from '../models/user.model'

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.status(401).json({ message: 'No token provided' })
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as User
		req.user = decoded
		next()
	} catch (error: any) {
		return res.status(401).json({ message: error.message })
	}
}

export default authenticateToken
