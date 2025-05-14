// filepath: /app/[locale]/(tenancy)/_actions/getAvailableTeachersByFrameAndTimeslot.ts
'use server'

import { getDbInstance } from "@/lib/database/db-instance";

/**
 * Returns a list of available teachers for a given frame, day, and timeslot.
 * @param frameId - The frame template ID
 * @param dayIndex - The index of the day within the frame (0-based)
 * @param timeslotId - The timeslot ID
 * @returns Array of available teacher objects
 */
export async function getAvailableTeachersByFrameAndTimeslot(frameId: string, dayIndex: number, timeslotId: number) {
  const db = await getDbInstance();
  const availableTeachers = await db.getAvailableTeachersByFrameAndTimeslot(frameId, dayIndex, timeslotId);
  return availableTeachers;
}
