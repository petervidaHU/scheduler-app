import {
  DataWithOptions,
  SyllabusSubjectWithOptions,
} from "@/types/ScheduleTypes";
import {
  ErrorObject,
  ScheduleValidationResult,
  ScheduleValidationTypes,
} from "./scheduleValidationTypes";
import { LessonInput } from "@/types/FormActionType";
import { Subject, ClassRoom } from "@/types/databaseTypes";

export type validationType = "schedule" | "other";

const specilityError: ErrorObject = {
  message: "Speciality of classroom and subject does not match",
  type: "warning",
  context: "classroom",
  num: 0,
};

const teacherError: ErrorObject = {
  message: "Teacher does not match",
  type: "warning",
  context: "teacher",
  num: 0,
};

const capacityError: ErrorObject = {
  message: "Capacity does not match",
  type: "error",
  context: "classroom",
  num: 0,
};

const occurenceError: ErrorObject = {
  message: "occurence does not match",
  type: "error",
  context: "default",
  num: 0,
};

const validationFunctionWithLessonsBinder = (
  lessonsFilteredBySubjects: Array<LessonInput>,
  subjects: DataWithOptions<Subject>,
  classRooms: DataWithOptions<ClassRoom>
): Partial<
  Record<
    ScheduleValidationTypes,
    (k: SyllabusSubjectWithOptions) => ErrorObject | null
  >
> => ({
  teacher: (s) => {
    const myError = {...teacherError};
    const preferredTeachers = typeof s.TEACHERS === 'string' 
      ? JSON.parse(s.TEACHERS) 
      : (s.TEACHERS || []);
    if (preferredTeachers.length === 0) return null;

    const result = lessonsFilteredBySubjects.filter(
      (l) => l.teacher && !preferredTeachers.includes(Number(l.teacher))
    );
    if (result.length === 0) return null;

    myError.num = result.length;
    return myError;
  },
  speciality: (s) => {
    const preferredSpeciality =
      subjects[
        s.SUBJECT_ID as keyof typeof subjects
      ].SPECIALTY_ID?.toString() || null;
    if (preferredSpeciality === null) return null;

    const result = lessonsFilteredBySubjects.filter(
      (l) =>
        classRooms[
          l.classRoom?.toString() as string
        ]?.SPECIALITY_ID?.toString() !== preferredSpeciality
    );
    if (result.length === 0) return null;

    specilityError.num = result.length;
    return specilityError;
  },
});

export const useSubjectValidation = (
  scheduleLessons: Record<string, LessonInput>,
  subjects: DataWithOptions<Subject>,
  classrooms: DataWithOptions<ClassRoom>,
  options?: { validations?: any }
): ((s: SyllabusSubjectWithOptions) => ScheduleValidationResult) => {
  return (s: SyllabusSubjectWithOptions): ScheduleValidationResult => {
    const result: ScheduleValidationResult = {};
    const lessonsForSubject = Object.values(scheduleLessons).filter(
      (l) => l.subject == s.SUBJECT_ID
    );
    if (lessonsForSubject.length === 0) return result;

    const validators = validationFunctionWithLessonsBinder(
      lessonsForSubject,
      subjects,
      classrooms
    );

    Object.entries(validators).forEach(([type, fn]) => {
      result[type as ScheduleValidationTypes] = fn(s);
    });

    return result;
  };
};
