import mongoose, { Document, Model, Schema } from 'mongoose'

export interface MonthlyBudget extends Document {
	user: mongoose.Types.ObjectId
	month: number
	year: number
	budget: number
	createdAt: Date
}

const monthlyBudgetSchema: Schema<MonthlyBudget> = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	month: { type: Number, required: true },
	year: { type: Number, required: true },
	budget: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now },
})

const MonthlyBudget: Model<MonthlyBudget> = mongoose.model<MonthlyBudget>(
	'MonthlyBudget',
	monthlyBudgetSchema
)

export default MonthlyBudget
