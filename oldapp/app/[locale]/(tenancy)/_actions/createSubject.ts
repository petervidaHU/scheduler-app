/*
"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";

export const createSubject = async (
  state: FormActionType,
  { name, description, specialityId, helperColor }: { name: string; description: string, specialityId: ID | null, helperColor: string | null}
): Promise<FormActionType> => {
  if (!name) {
    return { success: false, error: "Email and name are required", data: null };
  }
  try {
    const db = await getDbInstance();
    const result = await db.createSubject(name, description, specialityId, helperColor);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error creating subject: ${error}`);
    return { success: false, data: null, error: error };
  }
};
*/
"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";
import { FormActionType } from "@/types/FormActionType";

export const manageSubject = async (
  state: FormActionType,
  { name, description, id, specialtyId, helperColor }: { name: string; description: string, id: ID | null, helperColor: string, specialtyId: number | null}
): Promise<FormActionType> => {
  if (!name) {
    return { success: false, error: "name are required", data: null };
  }
  try {
    let result: any;
    const db = await getDbInstance();
    if(id) {
     result = await db.updateSubject(+(id as number), name, description, specialtyId, helperColor);
    } else {
      result = await db.createSubject(name, description, specialtyId, helperColor );
    }
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error manage subject: ${error}`);
    return { success: false, data: null, error: error };
  }
};
