import { Request, Response } from 'express'
import Budget from '../models/budget.model'

export async function addManualExpenseController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { expenses } = req.body
		if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
			res.status(400).json({
				error: true,
				message: 'No expenses provided',
			})
			return
		}

		if (!req.user || !req.user.user || !req.user.user._id) {
			res.status(401).json({ error: true, message: 'Unauthorized' })
			return
		}

		let totalExpense = 0
		for (const expense of expenses) {
			const price = Number(expense.price)
			const quantity = Number(expense.quantity)
			if (isNaN(price) || isNaN(quantity)) {
				res.status(400).json({
					error: true,
					message: 'Invalid expense values provided',
				})
				return
			}
			totalExpense += price * quantity
		}

		const userId = req.user.user._id

		const now = new Date()
		const month = now.getMonth() + 1
		const year = now.getFullYear()

		const budgetRecord = await Budget.findOne({ user: userId, month, year })
		if (budgetRecord) {
			budgetRecord.budget = budgetRecord.budget - totalExpense
			await budgetRecord.save()
		} else {
			res.status(404).json({
				error: true,
				message: 'Budget record not found for current month',
			})
			return
		}

		res.status(200).json({
			error: false,
			message: 'Expenses added successfully and budget updated',
			totalExpense,
		})
		return
	} catch (error) {
		res.status(500).json({ error: true, message: 'Error adding expense' })
	}
}
