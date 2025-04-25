'use server'

import { getDbInstance } from "@/lib/database/db-instance";
import { FormActionType } from "@/types/FormActionType";

export const deleteSpeciality = async ( state: FormActionType, id: number): Promise<FormActionType> => {
    try {
       const db = await getDbInstance();
       const result = await db.deleteSpeciality(id);
       return { success: true, data: result, error: null };
     } catch (error) {
       console.error(`Error deletingspeciality: ${error}`);
       return { success: false, data: null, error: error };
     }
};