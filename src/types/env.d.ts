declare namespace NodeJS {
	interface ProcessEnv {
		PORT?: string
		GOOGLE_API_KEY?: string
		JWT_SECRET?: string
		MONGO_DB_PASSWORD?: string
		GMAIL_APP_PASSWORD?: string
	}
}
