'use server';

import { dataObjectCreator } from "@/lib/dataObjectCreator";
import { getDbInstance } from "@/lib/database/db-instance";
import { Entities } from "@/types/Entities";
import { Specialty, Subject } from "@/types/databaseTypes";

export const getBasicEntities = async (label: Entities) => {
  try {
    const db = await getDbInstance();
    const labelTypeMapping: Partial<Record<Entities, any>> = {
      specialty: (db.getAllBasicEntity<Specialty>).bind(db),
      subject: (db.getAllBasicEntity<Subject>).bind(db),
    };
    const result = await labelTypeMapping[label](label);
    const mapped = dataObjectCreator(result)

    return { success: true, data: mapped };
  } catch (error) {
    console.error(`Error fetching basic data for ${label}: ${error}`);
    return { success: false, error: error };
  }
};
