"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType, SyllabusInputForm } from "@/types/FormActionType";
export type NormalizedSyllabus = [ID, number, ID | null][];

const normalizeSyllabus = (syllabus: Record<ID, SyllabusInputForm>) => {
  return Object.entries(syllabus).reduce<NormalizedSyllabus>(
    (acc, [subjectId, { occurence, teachers }]) => {
      if (teachers.length === 0) {
        acc.push([subjectId, occurence, null]);
      } else {
        teachers.forEach((_teacherId, idx) => {
          acc.push([subjectId, occurence, teachers[idx]]);          
        })
      }
      return acc;
    },
    []
  );
};

export const createClass = async (
  state: FormActionType,
  {
    className,
    numberOfStudents,
    syllabus,
  }: { className: string; numberOfStudents: string; syllabus: Record<ID, any> }
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
    const syllabusNormalized = normalizeSyllabus(syllabus);
    const result = await db.createClass(className, numberOfStudents, syllabusNormalized);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating class: ${error}`);
    return { success: false, data: null, error: error };
  }
};
