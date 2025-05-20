'use server';

import { getDbInstance } from "@/lib/database/db-instance";
import { FormActionType, LessonInput } from "@/types/FormActionType";
import { ID } from "@/types/databaseTypes";
import { ScheduleContext } from "./createSchedule";

export async function updateSchedule(
  state: FormActionType, 
  context: ScheduleContext & { id: string }
): Promise<FormActionType> {
  try {
    const db = await getDbInstance();
    // Update schedule and lessons in a single transaction
    await db.updateSchedule(
      context.id,
      context.frameId,
      context.description,
      context.owner,
      context.lessons,
      context.days,
      context.class,
      context.name,
      context.usingCustomTimeslots,
      context.customTimeslots
    );

    return {
      success: true,
      data: { id: context.id },
      error: null
    };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}