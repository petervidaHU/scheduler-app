"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID, Syllabus } from "@/types/databaseTypes";
import { DataWithOptions } from "@/types/ScheduleTypes";

export const getSyllabusAction = async (classId: ID): Promise<DataWithOptions<Syllabus> | null> => {
  try {
    const db = await getDbInstance();
    const syllabus = await db.getSyllabus(classId);
    console.log('------------------------------------------------------------------', syllabus)
    return syllabus.reduce(
      (acc, item) => {
        acc[item.SUBJECT_ID] = {
          value: item.SUBJECT_ID.toString(),
          label: item.SUBJECT_ID.toString(),
          ...item,
          TEACHERS: item.TEACHERS ? JSON.parse(item.TEACHERS) : [],
        };
        return acc;
      },
      {} as DataWithOptions<Syllabus>
    )
  } catch (error) {
    return null;
  }
};
