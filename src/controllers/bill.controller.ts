import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { detectTextFromBuffer } from '../services/vision.service'
import { structureBillData } from '../services/aiProcessor.service'
import Budget from '../models/budget.model'

export async function processBillController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		if (!req.file) {
			res.status(400).json({ error: 'No bill file provided' })
			return
		}

		// Create temporary directory and file path.
		const tmpDir = path.join(__dirname, '../../tmp')
		if (!fs.existsSync(tmpDir)) {
			fs.mkdirSync(tmpDir)
		}
		const tmpFilePath = path.join(tmpDir, req.file.originalname)
		fs.writeFileSync(tmpFilePath, req.file.buffer)

		// Extract raw text using Vision API.
		const visionResult = await detectTextFromBuffer(req.file.buffer)
		const rawText = visionResult.fullTextAnnotation || ''

		// Transform the raw text into structured JSON via generative AI.
		const structuredData = await structureBillData(rawText)

		// Clean up the temporary file.
		fs.unlinkSync(tmpFilePath)

		const totalAmount = structuredData.totalAmount
		if (typeof totalAmount !== 'number') {
			throw new Error(
				'Total amount is missing or invalid in structured data'
			)
		}

		if (!req.user || !req.user.user || !req.user.user._id) {
			res.status(401).json({ message: 'Unauthorized' })
			return
		}
		const userId = req.user.user._id

		// Get the current month and year.
		const now = new Date()
		const month = now.getMonth() + 1
		const year = now.getFullYear()

		// Find the budget record for this user, month, and year.
		const budgetRecord = await Budget.findOne({ user: userId, month, year })
		if (budgetRecord) {
			// Deduct the total amount from the budget.
			budgetRecord.budget = budgetRecord.budget - totalAmount
			await budgetRecord.save()
		} else {
			// Optionally, you could create a new budget record if it doesn't exist.
			res.status(400).json({
				message: 'Budget record not found for current month',
			})
			return
		}

		// Send the structured JSON response.
		res.json({
			message: 'Bill processed successfully',
			structuredData, // This is now a JSON object with items, totalAmount, etc.
		})
	} catch (error) {
		console.error('Error processing bill:', error)
		res.status(500).json({ error: 'Error processing bill' })
	}
}
