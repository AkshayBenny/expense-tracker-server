export interface User {
	id: string
	username: string
	email: string
	password: string
	role: 'user' | 'admin'
	createdAt: Date
}

export const users: User[] = []
