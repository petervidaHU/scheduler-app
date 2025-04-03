"use server";

import db from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";

export const createClassRoom = async (
  state: FormActionType,
  { name: classRoomName, capacity, specialityId }: { name: string; capacity: number, specialityId: ID | null }
): Promise<FormActionType> => {
  if (!classRoomName) {
    return { success: false, error: "name is required", data: null };
  }
  try {
    const result = await db.createClassRoom(classRoomName, capacity, specialityId);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating classroom: ${error}`);
    return { success: false, data: null, error: error };
  }
};
