'use server';

import { getDbInstance } from "@/lib/database/db-instance";
import { DayPlan, Schedule } from "@/types/ScheduleTypes";
import { ID } from "@/types/databaseTypes";

export async function getScheduleById(id: string): Promise<Schedule | null> {
  try {
    if (!id) return null;
    
    const db = await getDbInstance();
    return await db.getScheduleById(Number(id));
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
} 