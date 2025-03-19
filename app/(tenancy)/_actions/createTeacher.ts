"use server";

import db from "@/lib/database/bd-instance";
import { FormActionType } from "@/types/FormActionType";

export const createTeacher = async (
  state: FormActionType,
  { name, email }: { name: string; email: string }
): Promise<FormActionType> => {
  if (!email || !name) {
    return { success: false, error: "Email and name are required", data: null };
  }
  try {
    const result = await db.createTeacher(name, email);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating teacher: ${error}`);
    return { success: false, data: null, error: error };
  }
};
         