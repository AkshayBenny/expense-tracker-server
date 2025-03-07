import mongoose, { Document, Model, Schema } from 'mongoose'

export interface User extends Document {
	name: string
	email: string
	password: string
	monthlyBudget: number
	currency: string
	createdAt: Date
	updatedAt: Date
}

const userSchema: Schema<User> = new Schema({
	name: {
		type: String,
		required: true,
	},

	email: {
		type: String,
		required: true,
		unique: true,
	},

	password: {
		type: String,
		required: true,
		select: false,
	},

	monthlyBudget: {
		type: Number,
		required: true,
		default: 0,
	},

	currency: {
		type: String,
		required: true,
		default: 'USD',
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},

	updatedAt: {
		type: Date,
		default: Date.now,
	},
})

userSchema.pre('save', function (next) {
	this.updatedAt = new Date()
	next()
})

const User: Model<User> = mongoose.model<User>('User', userSchema)
export default User
