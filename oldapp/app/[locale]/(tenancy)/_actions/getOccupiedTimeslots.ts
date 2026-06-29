'use server'

import { getDbInstance } from "@/lib/database/db-instance";

export async function getOccupiedTimeslotsByFrame(classRoomId: number | null | undefined, frameId: string) {
  // TODO: Replace with real API call or logic
    const db = await getDbInstance();
    const occupiedTimeslots = await db.getOccupiedTimeslotsByFrame(frameId, classRoomId);
    if (occupiedTimeslots) {
      return occupiedTimeslots;
    }
    console.error("No occupied timeslots found for the given frame and classroom ID.");
  return [];
}