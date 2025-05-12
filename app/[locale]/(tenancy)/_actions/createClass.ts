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
    console.log("Creating class with:", { className, numberOfStudents, syllabus });
    const db = await getDbInstance();
    const result = await db.createClass(className, numberOfStudents, syllabus);
    console.log("Class created successfully:", result);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating class: ${error}`);
    console.error("SQL Error details:", { syllabus, className, numberOfStudents });
    return { success: false, data: null, error: error };
  }
};
