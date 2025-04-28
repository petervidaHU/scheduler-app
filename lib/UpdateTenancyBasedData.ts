'use server';

import { Entities } from "@/types/Entities";
import { getDbInstance } from "./database/db-instance";

export const refetchTenancyBasedData = async (label: Entities) => {
  try {
    const db = await getDbInstance();
    const labelMapping: Partial<Record<Entities, any>> = {
      specialty: db.getAllSpeciality.bind(db),
      classroom: db.getAllClassRooms.bind(db),
      subject: db.getAllSubjects.bind(db),
      teacher: db.getAllTeachers.bind(db),
      class: db.getAllClasses.bind(db),
    };
    const result = await labelMapping[label]();
    
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error updating tenancy based data: ${error}`);
    return { success: false, error: error };
  }
};
