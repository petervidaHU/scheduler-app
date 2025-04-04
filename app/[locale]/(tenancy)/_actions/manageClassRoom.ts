"use server";

import db from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";

export const manageClassRoom = async (
  state: FormActionType,
  {
    name: classRoomName,
    capacity,
    specialityId,
    id,
  }: { name: string; capacity: number; specialityId: ID | null; id: ID | null }
): Promise<FormActionType> => {
  if (!classRoomName) {
    return { success: false, error: "name is required", data: null };
  }
  try {
    if (id) {
      console.log('in update', classRoomName, capacity, specialityId, id);
      const result = await db.updateClassRoom(
        classRoomName,
        capacity,
        +(specialityId as number),
        +(id as number)
      );
      return { success: true, data: result, error: null };
    }
    const result = await db.createClassRoom(
      classRoomName,
      capacity,
      specialityId
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating classroom: ${error}`);
    return { success: false, data: null, error: error };
  }
};
