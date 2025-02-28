import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { detectTextFromBuffer } from '../services/vision.service'
import { structureBillData } from '../services/aiProcessor.service'

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
