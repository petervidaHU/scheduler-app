// filepath: /app/[locale]/(tenancy)/_actions/getAvailableClassroomsByFrameAndTimeslot.ts
'use server'

import { getDbInstance } from "@/lib/database/db-instance";

/**
 * Returns a list of available classrooms for a given frame, day, and timeslot.
 * @param frameId - The frame template ID
 * @param dayIndex - The index of the day within the frame (0-based)
 * @param timeslotId - The timeslot ID
 * @returns Array of available classroom objects
 */
export async function getAvailableClassroomsByFrameAndTimeslot(frameId: string, dayIndex: number, timeslotId: number) {
  const db = await getDbInstance();
  const availableClassrooms = await db.getAvailableClassroomsByFrameAndTimeslot(frameId, dayIndex, timeslotId);
  return availableClassrooms;
}
