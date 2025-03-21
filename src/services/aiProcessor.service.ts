import { GoogleGenerativeAI } from '@google/generative-ai'
import { GOOGLE_API_KEY } from '../config/env'

export async function structureBillData(rawText: string): Promise<any> {
	const prompt = `
    Given the following receipt text, extract the details and convert them into a JSON object. 
    The JSON should have an "items" array where each item includes:
      - "name": item name (string)
      - "price": item price (number)
      - "quantity": quantity (number)
      - "category": inferred category (string)
    Also, include a "totalAmount" field if present.
    Also, extract the shop name (as "shopName") if available.
    Return only plain JSON without any formatting or explanations.
    Here is the receipt text:
    ${rawText}
  `

	try {
		const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

		const result = await model.generateContent(prompt)
		let responseText = result.response.text()

		// Improved markdown code block extraction
		const codeBlockRegex = /```(?:[a-z]+)?\n([\s\S]*?)```/
		const match = responseText.match(codeBlockRegex)
		if (match) {
			responseText = match[1].trim()
		} else {
			// Fallback: remove any remaining backticks
			responseText = responseText.replace(/```/g, '').trim()
		}

		// Remove non-printable characters
		responseText = responseText.replace(/[\u200B-\u200D\uFEFF]/g, '')

		try {
			const structuredData = JSON.parse(responseText)
			return structuredData
		} catch (parseError: any) {
			console.error('JSON parsing failed:', {
				message: parseError.message,
				responseText: responseText,
			})
			throw new Error('Invalid JSON response from Gemini API')
		}
	} catch (error) {
		console.error('Error processing bill:', error)
		throw error
	}
}
