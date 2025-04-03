"use server";

import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import db from "@/lib/database/db-instance";

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

    const result = await db.createTenancy(tenancyName, userEmail);
    return { data: result, error: null };
}
