"use server";

import db from "@/lib/database/bd-instance";
import { ID, Syllabus } from "@/types/databaseTypes";

export const getSyllabusAction = async (classId: ID) => {
  try {
    const syllabus = await db.getSyllabus(classId);
    console.log("syllabus", syllabus);
    return syllabus;
  } catch (error) {
    return null;
  }
};
