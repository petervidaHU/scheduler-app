"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";
import { SyllabusFormProperties } from "@/types/ScheduleTypes";
export type NormalizedSyllabus = [ID, number, ID | null][];

export const createClass = async (
  state: FormActionType,
  {
    className,
    numberOfStudents,
    syllabus,
  }: { className: string; numberOfStudents: string; syllabus: Record<ID, SyllabusFormProperties> }
): Promise<FormActionType> => {
  if (!className || !numberOfStudents) {
    return {
      success: false,
      error: "name and number of students are required",
      data: null,
    };
  }
  try {
    const db = await getDbInstance();
    const result = await db.createClass(className, numberOfStudents, syllabus);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating class: ${error}`);
    return { success: false, data: null, error: error };
  }
};
