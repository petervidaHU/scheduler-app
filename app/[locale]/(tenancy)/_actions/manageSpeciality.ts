"use server";

import db from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";

export const manageSpeciality = async (
  state: FormActionType,
  { specialityName, description, id }: { specialityName: string; description: string, id: ID | null}
): Promise<FormActionType> => {
  if (!specialityName) {
    return { success: false, error: "name are required", data: null };
  }
  try {
    let result: any;
    if(id) {
     result = await db.updateSpeciality(specialityName, description, +(id as number));
    } else {
      result = await db.createSpeciality(specialityName, description );
    }
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating speciality: ${error}`);
    return { success: false, data: null, error: error };
  }
};
