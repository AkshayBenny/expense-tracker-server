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
	totalAmount: { type: Number, required: true },
	rawText: { type: String },
	createdAt: { type: Date, default: Date.now },
})

const Bill: Model<Bill> = mongoose.model<Bill>('Bill', billSchema)
export default Bill
// {
//     "message": "Bill processed successfully",
//     "structuredData": {
//         "items": [
//             {
//                 "name": "T-Shirt",
//                 "price": 25.5,
//                 "quantity": 1,
//                 "category": "Clothing"
//             },
//             {
//                 "name": "Watches",
//                 "price": 299,
//                 "quantity": 1,
//                 "category": "Accessories"
//             },
//             {
//                 "name": "Pants",
//                 "price": 32.99,
//                 "quantity": 1,
//                 "category": "Clothing"
//             },
//             {
//                 "name": "Socks",
//                 "price": 6.5,
//                 "quantity": 1,
//                 "category": "Clothing"
//             }
//         ],
//         "totalAmount": 363.99
//     }
// }
