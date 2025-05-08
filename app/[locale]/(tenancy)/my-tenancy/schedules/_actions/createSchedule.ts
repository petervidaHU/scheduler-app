'use server';

import { getDbInstance } from "@/lib/database/db-instance";
import { FormActionType, LessonInput } from "@/types/FormActionType";
import { ID } from "@/types/databaseTypes";

export interface ScheduleContext {
  name: string;
  description: string;
  period: number;
  class: string;
  lessons: Record<string, LessonInput>;
  days: Array<{ id: string; timeSlots: Array<{ timeslotId: ID }> }>;
}

export async function createSchedule(state: FormActionType, context: ScheduleContext): Promise<FormActionType> {
  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++context", context);
  try {
    const db = await getDbInstance();
    
    // Create schedule and lessons in a single transaction
    const scheduleId = await db.createSchedule(
      context.period,
      context.description,
      context.name,
      context.lessons,
      context.days
    );

    return {
      success: true,
      data: { id: scheduleId },
      error: null
    };
  } catch (error) {
    console.error('Error creating schedule:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
