import { MONGO_DB_PASSWORD } from './env'

export const dbConfig = {
	connectionString: `mongodb+srv://akshaybennyajhuk:${MONGO_DB_PASSWORD}@cluster0.onqzs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
}
