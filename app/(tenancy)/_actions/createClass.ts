"use server";

import db from "@/lib/database/bd-instance";
import { FormActionType } from "@/types/FormActionType";

export const createClass = async (
  state: FormActionType,
  { className, numberOfStudents }: { className: string; numberOfStudents: string }
): Promise<FormActionType> => {
  if (!className || !numberOfStudents) {
    return { success: false, error: "name and number of students are required", data: null };
  }
  try {
    const result = await db.createClass(className, numberOfStudents);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating teacher: ${error}`);
    return { success: false, data: null, error: error };
  }
};
