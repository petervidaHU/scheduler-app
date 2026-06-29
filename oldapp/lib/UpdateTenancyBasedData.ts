'use server';

import { Entities } from "@/types/Entities";
import { getDbInstance } from "./database/db-instance";
import { dataObjectCreator } from "./dataObjectCreator";
import { Classes, ClassRoom, Specialty, Subject, Teacher, Frame } from "@/types/databaseTypes";

export const refetchTenancyBasedData = async (label: Entities) => {
  try {
    const db = await getDbInstance();
    const labelTypeMapping: Partial<Record<Entities, any>> = {
      specialty: (db.getAllEntity<Specialty>).bind(db),
      classroom: (db.getAllEntity<ClassRoom>).bind(db),
      subject: (db.getAllEntity<Subject>).bind(db),
      teacher: (db.getAllEntity<Teacher>).bind(db),
      class: (db.getAllEntity<Classes>).bind(db),
      frame: (db.getAllEntity<Frame>).bind(db),
    };
    const result = await labelTypeMapping[label](label);
    const mapped = dataObjectCreator(result)

    return { success: true, data: mapped };
  } catch (error) {
    console.error(`Error updating tenancy based data for ${label}: ${error}`);
    return { success: false, error: error };
  }
};
