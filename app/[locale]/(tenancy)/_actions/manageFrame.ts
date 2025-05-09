"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";

export const manageFrame = async (
  state: FormActionType,
  {
    name: frameName,
    recurrence,
    numberOfDays,
    description = "",
    id,
  }: { name: string; recurrence: number; numberOfDays: number; description?: string; id: ID | null }
): Promise<FormActionType> => {
  if (!frameName) {
    return { success: false, error: "name is required", data: null };
  }
  const db = await getDbInstance();
  try {
    if (id) {
      const result = await db.updateFrame(
        frameName,
        recurrence,
        numberOfDays,
        description,
        +(id as number)
      );
      return { success: true, data: result, error: null };
    }
    const result = await db.createFrame(
      frameName,
      recurrence,
      numberOfDays,
      description
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error managing frame: ${error}`);
    return { success: false, data: null, error: error };
  }
}; 