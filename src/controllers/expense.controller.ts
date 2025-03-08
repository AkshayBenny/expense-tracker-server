import { Request, Response } from 'express'
import Budget from '../models/budget.model'

export async function addManualExpenseController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { expenses } = req.body
		if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
			res.status(400).json({ message: 'No expenses provided' })
			return
		}

		let totalExpense = 0
		expenses.forEach((expense: any) => {
			totalExpense += Number(expense.price) * Number(expense.quantity)
		})

		if (!req.user || !req.user.user || !req.user.user._id) {
			res.status(401).json({ message: 'Unauthorized' })
			return
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
			res.status(400).json({
				message: 'Budget record not found for current month',
			})
			return
		}

		res.status(200).json({
			message: 'Expenses added successfully and budget updated',
			totalExpense,
		})
	} catch (error) {
		console.error('Error adding expense:', error)
		res.status(500).json({ error: 'Error adding expense' })
	}
}
