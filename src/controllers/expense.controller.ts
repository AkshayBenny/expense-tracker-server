import { Request, Response } from 'express'

export async function addManualExpenseController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { expenses } = req.body
		if (!expenses || !expenses.length) {
			res.status(400).json({ message: 'No expenses provided' })
			return
		}
	} catch (error) {
		console.error('Error adding expense:', error)
		res.status(500).json({ error: 'Error adding expense' })
	}
}
