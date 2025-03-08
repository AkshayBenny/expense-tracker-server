import mongoose, { Document, Model, Schema } from 'mongoose'

export interface Budget extends Document {
	user: mongoose.Types.ObjectId
	month: number
	year: number
	budget: number
	currency: string
	createdAt: Date
}

const budgetSchema: Schema<Budget> = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	month: { type: Number, required: true },
	year: { type: Number, required: true },
	budget: { type: Number, required: true },
	currency: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
})

const Budget: Model<Budget> = mongoose.model<Budget>('Budget', budgetSchema)

export default Budget
