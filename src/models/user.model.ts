import mongoose, { Document, Model, Schema } from 'mongoose'

export interface User extends Document {
	name: string
	email: string
	password: string
	createdAt: Date
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

	createdAt: {
		type: Date,
		default: Date.now,
	},
})

const User: Model<User> = mongoose.model<User>('User', userSchema)
export default User
