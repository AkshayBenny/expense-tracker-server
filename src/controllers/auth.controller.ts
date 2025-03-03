import { Request, Response } from 'express'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'
import bcrypt from 'bcryptjs'
export async function signUpController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { name, email, password } = req.body

		if (!name || !email || !password) {
			res.status(400).json({ message: 'All fields are required' })
			return
		}

		const isUser = await User.findOne({ email: email })
		if (isUser) {
			res.status(400).json({ message: 'Email already exists' })
			return
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const newUser = new User({ name, email, password: hashedPassword })
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
		res.status(400).json({
			message:
				error instanceof Error
					? error.message
					: 'An unexpected error occurred',
		})
		return
	}
}

export async function loginController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			res.status(400).json({ message: 'Email and password are required' })
			return
		}

		const user = await User.findOne({ email }).select('+password')

		if (!user) {
			res.json(400).json({ message: 'User does not exist' })
			return
		}

		// *************** Encrypt password ***************
		const isPasswordMatch = await bcrypt.compare(password, user.password)
		if (!isPasswordMatch && user.email !== email) {
			res.status(400).json({ message: 'Invalid credentials' })
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
		res.status(400).json({
			message:
				error instanceof Error
					? error.message
					: 'An unexpected error occurred',
		})
		return
	}
}
