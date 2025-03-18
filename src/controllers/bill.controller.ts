import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { detectTextFromBuffer } from '../services/vision.service'
import { structureBillData } from '../services/aiProcessor.service'
import Budget from '../models/budget.model'
import Bill from '../models/bill.model'

export async function processBillController(
	req: Request,
	res: Response
): Promise<void> {
	console.log('DEBUG: Headers:', req.headers)
	console.log('DEBUG: Body:', req.body)
	console.log('DEBUG: File:', req.file)
	try {
		if (!req.file) {
			res.status(400).json({
				error: true,
				message: 'No bill file provided',
			})
			return
		}

		const tmpDir = path.join(__dirname, '../../tmp')
		if (!fs.existsSync(tmpDir)) {
			fs.mkdirSync(tmpDir)
		}
		const tmpFilePath = path.join(tmpDir, req.file.originalname)
		fs.writeFileSync(tmpFilePath, req.file.buffer)

		const visionResult = await detectTextFromBuffer(req.file.buffer)
		const rawText = visionResult.fullTextAnnotation || ''

		const structuredData = await structureBillData(rawText)

		fs.unlinkSync(tmpFilePath)

		const totalAmount = structuredData.totalAmount
		if (typeof totalAmount !== 'number') {
			res.status(401).json({
				message: 'Total amount must be a number',
				error: true,
			})
			return
		}

		if (!req.user || !req.user.user || !req.user.user._id) {
			res.status(401).json({ error: true, message: 'Unauthorized' })
			return
		}
		const userId = req.user.user._id

		const now = new Date()
		const month = now.getMonth() + 1
		const year = now.getFullYear()

		const budgetRecord = await Budget.findOne({ user: userId, month, year })
		if (budgetRecord) {
			budgetRecord.budget = budgetRecord.budget - totalAmount
			await budgetRecord.save()
		} else {
			res.status(400).json({
				error: true,
				message: 'Budget record not found for current month',
			})
			return
		}

		const newBill = new Bill({
			user: userId,
			items: structuredData.items,
			totalAmount: totalAmount,
			rawText: rawText,
			createdAt: now,
		})
		await newBill.save()

		res.json({
			error: false,
			message: 'Bill processed and saved successfully',
			data: structuredData,
		})
	} catch (error) {
		console.error('Error processing bill:', error)
		res.status(500).json({ error: true, message: 'Error processing bill' })
	}
}

export async function updateBillController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { billId } = req.params
		if (!billId) {
			res.status(400).json({
				error: true,
				message: 'Bill ID is required',
			})
			return
		}

		const bill = await Bill.findById(billId)
		if (!bill) {
			res.status(404).json({ error: true, message: 'Bill not found' })
			return
		}

		if (bill.user.toString() !== req.user?.user?._id) {
			res.status(403).json({
				error: true,
				message: 'Unauthorized to update this bill',
			})
			return
		}

		const oldTotal = bill.totalAmount

		let newTotal = oldTotal

		if (req.body.items !== undefined) {
			const items = req.body.items
			bill.items = items
			newTotal = items.reduce((acc: number, item: any) => {
				const price = Number(item.price) || 0
				const quantity = Number(item.quantity) || 1
				return acc + price * quantity
			}, 0)
			bill.totalAmount = newTotal
		}

		if (req.body.totalAmount !== undefined) {
			newTotal = Number(req.body.totalAmount)
			bill.totalAmount = newTotal
		}

		if (req.body.rawText !== undefined) {
			bill.rawText = req.body.rawText
		}

		const difference = newTotal - oldTotal

		const billDate = new Date(bill.createdAt)
		const month = billDate.getMonth() + 1
		const year = billDate.getFullYear()

		const budgetRecord = await Budget.findOne({
			user: req.user?.user?._id,
			month,
			year,
		})
		if (!budgetRecord) {
			res.status(400).json({
				error: true,
				message: 'Budget record not found for this bill',
			})
			return
		}

		budgetRecord.budget = budgetRecord.budget - difference
		await budgetRecord.save()

		await bill.save()

		res.json({
			error: false,
			message: 'Bill updated successfully',
			data: bill,
		})
		return
	} catch (error) {
		console.error('Error updating bill:', error)
		res.status(500).json({ error: true, message: 'Error updating bill' })
		return
	}
}

export async function getBillsController(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const userId = req.user?.user?._id
		if (!userId) {
			res.status(401).json({ error: true, message: 'Unauthorized' })
			return
		}

		const bills = await Bill.find({ user: userId }).sort({ createdAt: -1 })
		res.json({
			error: false,
			data: bills,
		})
		return
	} catch (error) {
		console.error('Error fetching bills:', error)
		res.status(500).json({ error: true, message: 'Error fetching bills' })
		return
	}
}
