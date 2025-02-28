declare namespace NodeJS {
	interface ProcessEnv {
		PORT?: string
		GOOGLE_APPLICATION_CREDENTIALS?: string
		GCLOUD_PROJECT?: string
		DOCUMENTAI_PROCESSOR_ID?: string
		DOCUMENTAI_REGION? : string
	}
}
