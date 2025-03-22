"use server";

import DatabaseService from "@/lib/database/db";
import { getAuth } from "../api/auth/[...nextauth]/getAuth";

export const createTenancyAction = async (state: any, formData: FormData) => {
    const session = await getAuth();
    const tenancyName = formData.get('name') as string;
    const userEmail = session.email as string;

    if (!tenancyName) {
       return { error: 'Tenancy name is required', data: null };
    }
    if (!userEmail) {
        return {error: 'Logged in user not found', data: null};
    }

    const databaseService = new DatabaseService();
    const result = await databaseService.createTenancy(tenancyName, userEmail);
    return { data: result, error: null };
}
