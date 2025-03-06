import { ROLES } from "@/constants/constants"

export interface UserSession {
    name: string | null,
    email: string | null,
    tenancyId: string | null,
    userId: string | null,
    userRole: Roles | null,
    status: 'authenticated' | 'unauthenticated'
}

export interface User {
    USER_ID: number,
    email: string,
    password_hash: string,
    first_name: string,
    last_name: string
}

export type Roles = keyof typeof ROLES;