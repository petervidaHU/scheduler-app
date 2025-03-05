export interface UserSession {
    name: string | null,
    email: string | null,
    tenancyId: string | null,
    status: 'authenticated' | 'unauthenticated'
}

export interface User {
    USER_ID: number,
    email: string,
    password_hash: string,
    first_name: string,
    last_name: string
}