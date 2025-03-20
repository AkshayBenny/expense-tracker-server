import { Request, Response } from 'express'
import Bill from '../models/bill.model'

export async function getAnalyticsController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		// Ensure the user is authenticated
		if (!req.user || !req.user.user || !req.user.user._id) {
			res.status(401).json({ error: true, message: 'Unauthorized' })
			return
		}
		const userId = req.user.user._id

		// Parse month/year from query; default to current if not provided
		const now = new Date()
		const defaultMonth = now.getMonth() + 1
		const defaultYear = now.getFullYear()

		const month = parseInt(req.query.month as string) || defaultMonth
		const year = parseInt(req.query.year as string) || defaultYear

		// Build date range for the start/end of the specified month
		const startOfMonth = new Date(year, month - 1, 1) // e.g., 2025-03-01
		const endOfMonth = new Date(year, month, 1) // e.g., 2025-04-01

		// 1. Fetch all bills for this user within the chosen month
		const monthlyBills = await Bill.find({
			user: userId,
			createdAt: { $gte: startOfMonth, $lt: endOfMonth },
		})

		// 2. Group items by category
		const categoryTotals: Record<string, number> = {}
		for (const bill of monthlyBills) {
			for (const item of bill.items) {
				const cat = item.category || 'Other'
				if (!categoryTotals[cat]) {
					categoryTotals[cat] = 0
				}
				categoryTotals[cat] += item.price * item.quantity
			}
		}

		// 3. Fetch recent bills (e.g., last 5 bills, regardless of month)
		const recentBills = await Bill.find({ user: userId })
			.sort({ createdAt: -1 })
			.limit(5)

		// Return analytics data
		res.json({
			error: false,
			message: 'Analytics retrieved successfully',
			data: {
				month,
				year,
				categoryTotals, // For your bar graph
				recentBills, // For the "Recent Receipts" list
			},
		})
	} catch (error) {
		console.error('Error fetching analytics:', error)
		res.status(500).json({
			error: true,
			message: 'Error fetching analytics',
		})
	}
}
