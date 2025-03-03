import { Request, Response } from 'express'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'
export async function signUpController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { name, email, password } = req.body

		if (!name) {
			res.status(400).json({ message: 'Name is required' })
			return
		}
		if (!email) {
			res.status(400).json({ message: 'Email is required' })
			return
		}
		if (!password) {
			res.status(400).json({ message: 'Password is required' })
			return
		}

		const isUser = await User.findOne({ email: email })
		if (isUser) {
			res.status(400).json({ message: 'Email already exists' })
			return
		}

		// *************** Encrypt password ***************
		const newUser = new User({ name, email, password })
		await newUser.save()

		const accessToken = jwt.sign({ newUser }, JWT_SECRET, {
			expiresIn: '12h',
		})

		res.status(201).json({
			message: 'Signed in successfully',
			token: accessToken,
			user: newUser,
		})

		return
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ message: error.message })
		} else {
			res.status(400).json({ message: 'An unexpected error occurred' })
		}
		return
	}
}

export async function loginController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { email, password } = req.body
		if (!email) {
			res.status(400).json({ message: 'Email is required' })
			return
		}
		if (!password) {
			res.status(400).json({ message: 'Password is required' })
			return
		}

		const user = await User.findOne({ email: email })

		if (!user) {
			res.json(400).json({ message: 'User does not exist' })
			return
		}

		// *************** Encrypt password ***************
		if (user.email !== email && user.password !== password) {
			res.status(400).json({ message: 'Credentials do no match' })
			return
		}
        
		const accessToken = jwt.sign({ user }, JWT_SECRET, {
			expiresIn: '12h',
		})

		res.status(200).json({
			message: 'Logged in successfully',
			token: accessToken,
		})
		return
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ message: error.message })
		} else {
			res.status(400).json({ message: 'An unexpected error occurred' })
		}
	}
}
