import { Request, Response } from 'express'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import {
	GMAIL_APP_PASSWORD,
	JWT_SECRET,
	REFRESH_TOKEN_SECRET,
} from '../config/env'
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
		await newUser.save()

		const tokenPayload = {
			_id: String(newUser._id),
			name: newUser.name,
			email: newUser.email,
			monthlyBudget: null,
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

		const budgetRecord = await Budget.findOne({ user: user._id })

		const tokenPayload = {
			_id: String(user._id),
			name: user.name,
			email: user.email,
			monthlyBudget: budgetRecord ? budgetRecord.budget : null,
			currency: user.currency,
		}

		const accessToken = jwt.sign({ user: tokenPayload }, JWT_SECRET, {
			expiresIn: '12h',
		})

		const refreshToken = jwt.sign(
			{ user: tokenPayload },
			REFRESH_TOKEN_SECRET,
			{
				expiresIn: '30d',
			}
		)

		res.status(200).json({
			message: 'Logged in successfully',
			token: accessToken,
			refreshToken,
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
		user.resetPasswordExpires = new Date(Date.now() + 3600000)
		await user.save()

		// Replace "myapp" with your actual custom scheme.
		const resetURL = `expense_tracker://reset-password/${resetToken}`

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

export async function refreshTokenController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { refreshToken } = req.body
		if (!refreshToken) {
			res.status(400).json({
				error: true,
				message: 'Refresh token is required',
			})
			return
		}

		jwt.verify(
			refreshToken,
			REFRESH_TOKEN_SECRET,
			(err: any, decoded: any) => {
				if (err) {
					res.status(401).json({
						error: true,
						message: 'Invalid or expired refresh token',
					})
					return
				}

				// Extract the user payload from the decoded token.
				const userPayload = (decoded as any).user

				// Sign a new access token with the user payload.
				const newAccessToken = jwt.sign(
					{ user: userPayload },
					JWT_SECRET,
					{
						expiresIn: '12h',
					}
				)
				res.status(200).json({ error: false, token: newAccessToken })
			}
		)
	} catch (error: any) {
		res.status(500).json({
			error: true,
			message: error.message || 'Error refreshing token',
		})
	}
}
