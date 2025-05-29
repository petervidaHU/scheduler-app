import { NormalizedDayPlan } from "@/components/day-planner/DayPlanner";
import { DayPlan, TimeslotLessonInput } from "@/types/ScheduleTypes";
import { Timeslots, TimeslotInput } from "@/types/databaseTypes";

/**
 * Normalizes a raw day object by merging template timeslots, custom timeslots, and lessons.
 * Returns a DayPlan ready for rendering in DayPlanner.
 * @param day Raw day object from backend/store
 * @param allTimeslots All global timeslots (from templates, etc.)
 * @param customTimeslots Custom timeslots for this schedule (TimeslotInput[])
 * @param lessons Lessons map (lessonId -> lesson)
 */
export function normalizeDayPlan(
  day: any,
  allTimeslots: Timeslots[],
  customTimeslots: TimeslotInput[],
  lessons: Record<string, TimeslotLessonInput>
): NormalizedDayPlan {
  // Merge all timeslots (template + custom)
  const getTimeslotById = (id: number) =>
    allTimeslots.find((ts) => ts.ID === id) ||
    customTimeslots.find((ts) => ts.ID === id) ||
    null;

  // Map timeSlots to include lesson and isCustom
  const normalizedTimeSlots = (day.timeSlots || []).map((t: any) => ({
    timeslot: getTimeslotById(t.timeslotId),
    lesson: t.lessonId ? lessons[t.lessonId] : undefined,
    isCustom: !!customTimeslots.find((ts) => ts.ID === t.timeslotId),
  }));

  return {
    ...day,
    timeSlots: normalizedTimeSlots,
  };
}
