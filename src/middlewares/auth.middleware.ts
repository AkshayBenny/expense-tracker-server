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
const protect = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		res.status(401).json({ message: 'No token provided' })
		return
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as User
		req.user = decoded
		next()
	} catch (error: any) {
		res.status(401).json({ message: error.message })
		return
	}
}

export default protect
