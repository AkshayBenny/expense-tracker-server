import { Request, Response } from 'express'
import MonthlyBudget from '../models/monthlybudget.model'

export async function addBudgetController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { user, month, year, budget } = req.body
		if (!user._id || !month || !year || !budget) {
			res.status(400).json({ message: 'Invalid details provided' })
			return
		}

		if (budget <= 0) {
			res.status(400).json({
				message: 'Budget cannot be 0 or be a negative number',
			})
			return
		}

		const newBudget = new MonthlyBudget({
			user: user._id,
			month,
			year,
			budget,
		})

		await newBudget.save()
		res.status(200).json({
			message: 'Budget added successfully',
		})
	} catch (error) {
		console.error('Error adding budget: ', error)
		res.status(500).json({ error: 'Error adding budget' })
		return
	}
}

