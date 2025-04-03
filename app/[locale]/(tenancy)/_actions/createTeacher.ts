"use server";

import db from "@/lib/database/db-instance";
import { FormActionType } from "@/types/FormActionType";

export const createTeacher = async (
  state: FormActionType,
  { teacherName, teacherEmail, description }: { teacherName: string; teacherEmail: string, description: string }
): Promise<FormActionType> => {
  if (!teacherEmail || !teacherName) {
    return { success: false, error: "Email and name are required", data: null };
  }
  try {
    const result = await db.createTeacher(teacherName, teacherEmail, description);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating teacher: ${error}`);
    return { success: false, data: null, error: error };
  }
};
         