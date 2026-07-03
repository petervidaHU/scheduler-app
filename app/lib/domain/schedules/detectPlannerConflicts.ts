import type { PlannerEntry } from "../../repositories/plannerRepository.server";

/**
 * Entries in the same schedule conflict when they overlap in time on the same
 * day and share a teacher or classroom. Pure calculation over already-loaded
 * planner data — cross-schedule conflicts (same frame, different schedule)
 * are prevented at creation time by getBookedResources and are not detected
 * here.
 */
export function detectPlannerConflicts(entries: PlannerEntry[]): Set<string> {
  const conflictIds = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i].timeslot;
      const b = entries[j].timeslot;

      if (a.dayOfWeek !== b.dayOfWeek) continue;

      const overlaps = a.startMinute < b.endMinute && a.endMinute > b.startMinute;
      if (!overlaps) continue;

      const sameTeacher = a.teacher !== null && b.teacher !== null && a.teacher.id === b.teacher.id;
      const sameClassroom =
        a.classroom !== null && b.classroom !== null && a.classroom.id === b.classroom.id;

      if (sameTeacher || sameClassroom) {
        conflictIds.add(entries[i].entryId);
        conflictIds.add(entries[j].entryId);
      }
    }
  }

  return conflictIds;
}
