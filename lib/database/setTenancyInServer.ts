'use server';

import db from "./db-instance";

export const setTenancyInServer = async (value: string) => {
    try {
       db.setTenancy(value);
    } catch (e: any) {
        console.error();
        throw new Error(e.message ? e.message : "Something went wrong: " + JSON.stringify(e));
    }
}