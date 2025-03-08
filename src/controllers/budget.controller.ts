import { Request, Response } from 'express'
import Budget from '../models/budget'

export async function addBudgetController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { budget, currency } = req.body
		if (!budget || !currency) {
			res.status(400).json({ message: 'Invalid details provided' })
			return
		}

		if (budget <= 0) {
			res.status(400).json({
				message: 'Budget cannot be 0 or be a negative number',
			})
			return
		}

		let userId: string | undefined
		if (req.user && req.user.user && req.user.user._id) {
			userId = req.user.user._id
		} else {
			res.status(401).json({ message: 'Unauthorized' })
			return
		}

		const now = new Date()
		const month = now.getMonth() + 1
		const year = now.getFullYear()

		const newBudget = new Budget({
			user: userId,
			month,
			year,
			budget,
			currency,
		})

		await newBudget.save()
		res.status(200).json({
			message: 'Budget added successfully',
		})
	} catch (error) {
		console.error('Error adding budget: ', error)
		res.status(500).json({ error: 'Error adding budget' })
	}
}

export async function getUserBudget(
	req: Request,
	res: Response
): Promise<void> {
	try {
		let userId: string | undefined
		if (req.user && req.user.user && req.user.user._id) {
			userId = req.user.user._id
		} else {
			res.status(401).json({ message: 'Unauthorized' })
			return
		}

		const userBudget = await Budget.findOne({ user: userId })
		res.status(200).json({
			budget: userBudget?.budget,
			currency: userBudget?.currency,
			month: userBudget?.month,
			year: userBudget?.year,
		})
	} catch (error) {
		console.error('Error retrieving budget: ', error)
		res.status(500).json({ error: 'Error retrieving budget' })
	}
}
