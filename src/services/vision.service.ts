import axios from 'axios'
import { GOOGLE_API_KEY } from '../config/env'

export interface TextDetectionResult {
	fullTextAnnotation?: string
}

/**
 * Calls Vision API via REST + API key to detect text in an image buffer.
 */
export async function detectTextFromBuffer(
	imageBuffer: Buffer,
	languageHints: string[] = ['en']
): Promise<TextDetectionResult> {
	try {
		// The payload matches the images:annotate format for Vision
		const requestPayload = {
			requests: [
				{
					image: {
						content: imageBuffer.toString('base64'),
					},
					features: [
						{
							type: 'TEXT_DETECTION',
						},
					],
					imageContext: {
						languageHints,
					},
				},
			],
		}

		// Make a POST request to the Vision API using your API key
		const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`

		const response = await axios.post(url, requestPayload, {
			headers: {
				'Content-Type': 'application/json',
			},
		})

		// The response data structure
		// typically: data.responses[0].textAnnotations[0].description
		const data = response.data
		if (
			data.responses &&
			data.responses.length > 0 &&
			data.responses[0].textAnnotations &&
			data.responses[0].textAnnotations.length > 0
		) {
			return {
				fullTextAnnotation:
					data.responses[0].textAnnotations[0].description,
			}
		}

		return {}
	} catch (error) {
		console.error('Error during text detection:', error)
		throw error
	}
}
