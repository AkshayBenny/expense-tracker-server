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

		const isUser = await User.findOne({ email })
		if (isUser) {
			res.status(400).json({ message: 'Email already exists' })
			return
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const newUser = new User({ name, email, password: hashedPassword })
		await newUser.save()

		const tokenPayload = {
			_id: String(newUser._id),
			name: newUser.name,
			email: newUser.email,
			monthlyBudget: newUser.monthlyBudget,
			currency: newUser.currency,
		}

		const accessToken = jwt.sign({ user: tokenPayload }, JWT_SECRET, {
			expiresIn: '12h',
		})

		res.status(201).json({
			message: 'Signed up successfully',
			token: accessToken,
			user: tokenPayload,
			error: false,
		})
	} catch (error) {
		res.status(400).json({
			error: true,
			message:
				error instanceof Error ? error.message : 'Signing up failed',
		})
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
			res.status(400).json({ message: 'User does not exist' })
			return
		}

		const isPasswordMatch = await bcrypt.compare(password, user.password)
		if (!isPasswordMatch) {
			res.status(400).json({ message: 'Invalid credentials' })
			return
		}

		// Build a flat user payload.
		const tokenPayload = {
			_id: String(user._id),
			name: user.name,
			email: user.email,
			monthlyBudget: user.monthlyBudget,
			currency: user.currency,
		}

		// Sign the token with a nested "user" property.
		const accessToken = jwt.sign({ user: tokenPayload }, JWT_SECRET, {
			expiresIn: '12h',
		})

		res.status(200).json({
			message: 'Logged in successfully',
			token: accessToken,
			user: tokenPayload,
			error: false,
		})
	} catch (error) {
		res.status(400).json({
			error: true,
			message:
				error instanceof Error
					? error.message
					: 'An unexpected error occurred',
		})
	}
}
