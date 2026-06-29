"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { FormActionType } from "@/types/FormActionType";

export const manageTimeslotTemplates = async (
  state: FormActionType,
  context: any,
): Promise<FormActionType> => {
  try {
    const db = await getDbInstance();
    db.createDayTemplateWithTimeslots(context.name, context.description, context.timeslots);
    return {
      data: null,
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(`Error creating timeslot template: ${error}`);
    return { success: false, data: null, error: error };
  }
};
