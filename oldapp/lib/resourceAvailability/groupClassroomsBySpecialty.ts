import { ClassRoom, Subject } from "@/types/databaseTypes";

/**
 * Groups classrooms by whether their specialty matches the subject's specialty.
 * Returns an array with two groups: preferred by specialty, and other.
 */
export function groupClassroomsBySpecialty(
  classRooms: Record<string, ClassRoom>,
  subject: Subject | undefined | null
) {
  if (!subject?.SPECIALTY_ID) {
    // No specialty, all classrooms are in 'other'
    return [
      { group: "preferred by speciality", items: [] },
      { group: "other", items: Object.values(classRooms) },
    ];
  }
  const specialty = subject.SPECIALTY_ID;
  const preferred: ClassRoom[] = [];
  const other: ClassRoom[] = [];
  Object.values(classRooms).forEach((room) => {
    if (room.SPECIALITY_ID === specialty) {
      preferred.push(room);
    } else {
      other.push(room);
    }
  });
  return [
    { group: "preferred by speciality", items: preferred },
    { group: "other", items: other },
  ];
}
