import mongoose, { Model, Schema } from 'mongoose'

export interface Bill extends Document {
	user: mongoose.Types.ObjectId
	items: {
		name: string
		price: number
		quantity: number
		category: string
	}[]
	totalAmount: number
	rawText?: string
	shopName: string
	createdAt: Date
}

const billSchema: Schema<Bill> = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	items: [
		{
			name: { type: String },
			price: { type: Number },
			quantity: { type: Number, default: 0 },
			category: { type: String },
		},
	],
	shopName: { type: String, default: 'Unknown' },
	totalAmount: { type: Number, required: true },
	rawText: { type: String },
	createdAt: { type: Date, default: Date.now },
})

const Bill: Model<Bill> = mongoose.model<Bill>('Bill', billSchema)
export default Bill
