"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID, Syllabus } from "@/types/databaseTypes";
import { DataWithOptions, DataWithOptionWithError } from "@/types/ScheduleTypes";

export const getSyllabusAction = async (
  classId: ID
): Promise<DataWithOptionWithError<Syllabus>> => {
  try {
    const db = await getDbInstance();
    const syllabus = await db.getSyllabus(classId);
    const data = syllabus.reduce(
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
    );
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error while fetching syllabus",
    };
  }
};
