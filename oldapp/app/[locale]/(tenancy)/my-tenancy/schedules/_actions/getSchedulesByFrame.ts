"use server";
import { getDbInstance } from "@/lib/database/db-instance";
import { ID } from "@/types/databaseTypes";

export async function getSchedulesByFrame(frameId: ID | string) {
  const db = await getDbInstance();
  return db.getSchedulesByFrame(frameId);
}
