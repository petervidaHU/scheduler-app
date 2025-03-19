"use server";

import db from "@/lib/database/bd-instance";
import { FormActionType } from "@/types/FormActionType";

export const createSpeciality = async (
  state: FormActionType,
  { specialityName, description }: { specialityName: string; description: string }
): Promise<FormActionType> => {
  if (!specialityName) {
    return { success: false, error: "name are required", data: null };
  }
  try {
    const result = await db.createSpeciality(specialityName, description);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating speciality: ${error}`);
    return { success: false, data: null, error: error };
  }
};
