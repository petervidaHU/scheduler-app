"use server";

import { getServerSession } from "next-auth/next"
import DatabaseService from "@/lib/database/db";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const createTenancyAction = async (state: any, formData: FormData) => {
    console.log('create tenancy action props:', state, formData);
    const session = await getServerSession(authOptions)
    const name = formData.get('name') as string;
    const email = session?.user?.email as string;

    if (!name) {
       return { error: 'Tenancy name is required', data: null };
    }
    if (!email) {
        return {error: 'Logged in user not found', data: null};
    }

    const databaseService = new DatabaseService();
    const result = await databaseService.createTenancy(name, email);
    console.log('result', result);
    return { data: result, error: null };
}
