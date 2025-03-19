"use server";

import db from "@/lib/database/bd-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";

export const createSubject = async (
  state: FormActionType,
  { name, description, specialityId }: { name: string; description: string, specialityId: ID | null }
): Promise<FormActionType> => {
  if (!name) {
    return { success: false, error: "Email and name are required", data: null };
  }
  try {
    const result = await db.createSubject(name, description, specialityId);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating subject: ${error}`);
    return { success: false, data: null, error: error };
  }
};
