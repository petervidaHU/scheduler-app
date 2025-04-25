'use server';

import { getDbInstance } from "./db-instance";

export const setTenancyInServer = async (value: number) => {
    const db = await getDbInstance();
    try {
       db.setTenancy(value);
    } catch (e: any) {
        console.error();
        throw new Error(e.message ? e.message : "Something went wrong: " + JSON.stringify(e));
    }
}