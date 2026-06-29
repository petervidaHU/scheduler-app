// filepath: /app/[locale]/(tenancy)/_actions/getOccupiedTimeslotsByTeacher.ts
'use server'

import { getDbInstance } from "@/lib/database/db-instance";

export async function getOccupiedTimeslotsByTeacher(teacherId: number | string | null | undefined, frameId: string) {
  if (!teacherId) return [];
  const db = await getDbInstance();
  const occupiedTimeslots = await db.getOccupiedTimeslotsByTeacher(frameId, teacherId);
  if (occupiedTimeslots) {
    return occupiedTimeslots;
  }
  console.error("No occupied timeslots found for the given frame and teacher ID.");
  return [];
}
