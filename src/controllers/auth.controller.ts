import { Request, Response } from 'express'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import { GMAIL_APP_PASSWORD, JWT_SECRET } from '../config/env'
import bcrypt from 'bcryptjs'
import Budget from '../models/budget.model'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

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
		const user = await newUser.save()

		const budgetRecord = await Budget.findOne({
			user: user._id,
		})

		const tokenPayload = {
			_id: String(newUser._id),
			name: newUser.name,
			email: newUser.email,
			monthlyBudget: budgetRecord ? budgetRecord : newUser.monthlyBudget,
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

		const budgetRecord = await Budget.findOne({
			user: user._id,
		})

		// Build a flat user payload.
		const tokenPayload = {
			_id: String(user._id),
			name: user.name,
			email: user.email,
			monthlyBudget: budgetRecord ? budgetRecord : user.monthlyBudget,
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

export async function forgotPasswordController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { email } = req.body
		if (!email) {
			res.status(400).json({ error: true, message: 'Email is required' })
			return
		}

		const user = await User.findOne({ email })
		if (!user) {
			res.status(200).json({
				error: false,
				message: 'If that email exists, you will receive a reset link.',
			})
			return
		}

		const resetToken = crypto.randomBytes(20).toString('hex')
		user.resetPasswordToken = resetToken
		user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour from now
		await user.save()

		// Replace "myapp" with your actual custom scheme.
		const resetURL = `myapp://reset-password/${resetToken}`

		const transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'laurenfaithttk@gmail.com', // Replace with your email
				pass: GMAIL_APP_PASSWORD, // Use an app password if using Gmail
			},
		})

		const mailOptions = {
			to: user.email,
			from: 'no-reply@etracker.com',
			subject: 'Password Reset',
			html: `
		  <p>You requested a password reset.</p>
		  <p>Please click the link below to reset your password:</p>
		  <p><a href="${resetURL}">Reset Password</a></p>
		  <p>If you cannot click the link, copy and paste this URL into your browser:</p>
		  <p>${resetURL}</p>
		  <p>This link will expire in one hour.</p>
		`,
		}

		await transporter.sendMail(mailOptions)

		res.status(200).json({
			error: false,
			message: 'If that email exists, you will receive a reset link.',
		})
		return
	} catch (error) {
		console.error('Forgot password error:', error)
		res.status(500).json({
			error: true,
			message: 'Error processing forgot password request',
		})
		return
	}
}

export async function resetPasswordController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { token, newPassword } = req.body
		if (!token || !newPassword) {
			res.status(400).json({
				error: true,
				message: 'Token and new password are required',
			})
			return
		}

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: new Date() },
		})

		if (!user) {
			res.status(400).json({
				error: true,
				message: 'Password reset token is invalid or has expired',
			})
			return
		}

		user.password = await bcrypt.hash(newPassword, 10)
		user.resetPasswordToken = undefined
		user.resetPasswordExpires = undefined

		await user.save()

		res.status(200).json({
			error: false,
			message: 'Password has been reset successfully',
		})
	} catch (error) {
		console.error('Reset password error:', error)
		res.status(500).json({
			error: true,
			message: 'Error resetting password',
		})
	}
}
