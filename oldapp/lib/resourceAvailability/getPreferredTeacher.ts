import { Teacher, SyllabusSubject } from "@/types/databaseTypes";

/**
 * Returns the preferred teacher for a subject, if any, as an object with id and name.
 * Returns null if no preferred teacher is set or not found in teachers.
 */
export function getPreferredTeacher(
  subject: SyllabusSubject | undefined | null,
  teachers: Record<string, Teacher>
): { id: string; name: string } | null {
  if (!subject?.TEACHERS?.length) return null;
  const preferredId = subject.TEACHERS[0]?.toString();
  if (!preferredId || !teachers[preferredId]) return null;
  return { id: preferredId, name: teachers[preferredId].NAME };
}
