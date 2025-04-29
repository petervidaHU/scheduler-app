'use server'

import { getDbInstance } from "@/lib/database/db-instance";
import { Entities } from "@/types/Entities";
import { FormActionType } from "@/types/FormActionType";

export const deleteTenancyBasedData = async (id: number, label: Entities) => {
    try {
       const db = await getDbInstance();
       const result = await db.deleteTenancyBasedData(id, label);
       return {success: true};
     } catch (error) {
       console.error(`Error deletingspeciality: ${error}`);
       return {success: false, error: error};
     }
};