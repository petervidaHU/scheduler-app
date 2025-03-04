interface UserSession {
    name: string | null,
    email: string | null,
    status: 'authenticated' | 'unauthenticated'
}