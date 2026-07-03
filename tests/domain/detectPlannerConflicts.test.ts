import { detectPlannerConflicts } from "../../app/lib/domain/schedules/detectPlannerConflicts";
import type { PlannerEntry } from "../../app/lib/repositories/plannerRepository.server";

function makeEntry(overrides: {
  entryId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  teacherId?: string | null;
  classroomId?: string | null;
}): PlannerEntry {
  return {
    entryId: overrides.entryId,
    timeslot: {
      id: `ts-${overrides.entryId}`,
      dayOfWeek: overrides.dayOfWeek,
      startMinute: overrides.startMinute,
      endMinute: overrides.endMinute,
      class: null,
      subject: null,
      teacher: overrides.teacherId ? { id: overrides.teacherId, name: "Teacher" } : null,
      classroom: overrides.classroomId ? { id: overrides.classroomId, name: "Room" } : null,
    },
  };
}

describe("detectPlannerConflicts", () => {
  test("flags two entries with the same teacher overlapping on the same day", () => {
    const entries = [
      makeEntry({ entryId: "a", dayOfWeek: 1, startMinute: 480, endMinute: 525, teacherId: "t1" }),
      makeEntry({ entryId: "b", dayOfWeek: 1, startMinute: 500, endMinute: 545, teacherId: "t1" }),
    ];

    const conflicts = detectPlannerConflicts(entries);

    expect(conflicts.has("a")).toBe(true);
    expect(conflicts.has("b")).toBe(true);
  });

  test("flags two entries with the same classroom overlapping on the same day", () => {
    const entries = [
      makeEntry({ entryId: "a", dayOfWeek: 2, startMinute: 480, endMinute: 525, classroomId: "r1" }),
      makeEntry({ entryId: "b", dayOfWeek: 2, startMinute: 510, endMinute: 555, classroomId: "r1" }),
    ];

    const conflicts = detectPlannerConflicts(entries);

    expect(conflicts.size).toBe(2);
  });

  test("does not flag entries on different days", () => {
    const entries = [
      makeEntry({ entryId: "a", dayOfWeek: 1, startMinute: 480, endMinute: 525, teacherId: "t1" }),
      makeEntry({ entryId: "b", dayOfWeek: 2, startMinute: 480, endMinute: 525, teacherId: "t1" }),
    ];

    expect(detectPlannerConflicts(entries).size).toBe(0);
  });

  test("does not flag entries that don't overlap in time", () => {
    const entries = [
      makeEntry({ entryId: "a", dayOfWeek: 1, startMinute: 480, endMinute: 525, teacherId: "t1" }),
      makeEntry({ entryId: "b", dayOfWeek: 1, startMinute: 525, endMinute: 570, teacherId: "t1" }),
    ];

    expect(detectPlannerConflicts(entries).size).toBe(0);
  });

  test("does not flag overlapping entries with different teachers and classrooms", () => {
    const entries = [
      makeEntry({ entryId: "a", dayOfWeek: 1, startMinute: 480, endMinute: 525, teacherId: "t1", classroomId: "r1" }),
      makeEntry({ entryId: "b", dayOfWeek: 1, startMinute: 490, endMinute: 535, teacherId: "t2", classroomId: "r2" }),
    ];

    expect(detectPlannerConflicts(entries).size).toBe(0);
  });

  test("does not flag entries with no teacher or classroom assigned", () => {
    const entries = [
      makeEntry({ entryId: "a", dayOfWeek: 1, startMinute: 480, endMinute: 525 }),
      makeEntry({ entryId: "b", dayOfWeek: 1, startMinute: 490, endMinute: 535 }),
    ];

    expect(detectPlannerConflicts(entries).size).toBe(0);
  });

  test("returns an empty set for a single entry", () => {
    const entries = [makeEntry({ entryId: "a", dayOfWeek: 1, startMinute: 480, endMinute: 525, teacherId: "t1" })];

    expect(detectPlannerConflicts(entries).size).toBe(0);
  });
});
