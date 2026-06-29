import { ROLES } from "@/constants/constants"

export interface UserSession {
    name: string | null,
    email: string | null,
    tenancyId: number | null,
    userId: string | null,
    userRole: Roles | null,
    status: 'authenticated' | 'unauthenticated'
}

export interface User {
    ID: number,
    EMAIL: string,
    PASSWORD_HASH: string,
    FIRST_NAME: string,
    LAST_NAME: string,
    GOOGLE_ID?: string,
    CREATED_AT: string,
    UPDATED_AT: string,
}

export type Roles = keyof typeof ROLES;