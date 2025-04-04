"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID, Syllabus } from "@/types/databaseTypes";

export const getSyllabusAction = async (classId: ID) => {
  try {
    const db = await getDbInstance();
    const syllabus = await db.getSyllabus(classId);
    console.log("syllabus", syllabus);
    return syllabus;
  } catch (error) {
    return null;
  }
};
