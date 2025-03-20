import { Request, Response } from 'express'
import Budget from '../models/budget.model'

function getUserId(req: Request): string | null {
	return req.user && req.user.user && req.user.user._id
		? req.user.user._id
		: null
}

export async function addBudgetController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { budget, currency } = req.body
		if (!budget || !currency) {
			res.status(400).json({
				error: true,
				message: 'Invalid details provided',
			})
			return
		}

		if (budget <= 0) {
			res.status(400).json({
				error: true,
				message: 'Budget has to be greater than 0',
			})
			return
		}

		let userId: string | undefined
		if (req.user && req.user.user && req.user.user._id) {
			userId = req.user.user._id
		} else {
			res.status(401).json({ error: true, message: 'Unauthorized' })
			return
		}

		const now = new Date()
		const month = now.getMonth() + 1
		const year = now.getFullYear()

		const budgetExists = await Budget.findOne({ user: userId })

		if (budgetExists) {
			budgetExists.budget = budget
			budgetExists.month = month
			budgetExists.year = year
			budgetExists.currency = currency
			await budgetExists.save()
			res.status(200).json({ error: false, message: 'Budget updated' })
			return
		}

		const newBudget = new Budget({
			user: userId,
			month,
			year,
			budget,
			currency,
		})

		await newBudget.save()
		res.status(201).json({
			error: false,
			message: 'Budget added successfully',
		})
		return
	} catch (error) {
		console.log(error)
		res.status(500).json({ error: true, message: 'Error adding budget' })
		return
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
		if (!userBudget) {
			res.status(404).json({ error: true, message: 'Budget not found' })
			return
		}

		res.status(200).json({
			error: false,
			budgetId: userBudget._id,
			budget: userBudget?.budget,
			currency: userBudget?.currency,
			month: userBudget?.month,
			year: userBudget?.year,
		})
		return
	} catch (error) {
		res.status(500).json({
			error: true,
			message: 'Error retrieving budget',
		})
		return
	}
}

export async function updateBudgetController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { budgetId } = req.params
		const { budget, currency } = req.body
		if (!budget || !currency) {
			res.status(400).json({
				error: true,
				message: 'Invalid budget or currency',
			})
			return
		}
		if (budget <= 0) {
			res.status(400).json({
				error: true,
				message: 'Budget cannot be negative',
			})
			return
		}

		let userId: string | undefined
		if (req.user && req.user.user && req.user.user._id) {
			userId = req.user.user._id
		} else {
			res.status(401).json({ error: true, message: 'Unauthorized' })
			return
		}

		const userBudget = await Budget.findOne({ _id: budgetId, user: userId })

		if (!userBudget) {
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
			res.status(201).json({
				error: false,
				message: 'No budget found. New budget created.',
			})

			return
		}

		userBudget.budget = budget
		userBudget.currency = currency

		await userBudget.save()
		res.status(200).json({
			error: false,
			message: 'Budget updated successfully',
		})

		return
	} catch (error) {
		res.status(500).json({
			error: true,
			message: 'Error updating budget',
		})
		return
	}
}
