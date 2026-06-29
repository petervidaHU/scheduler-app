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
    let preferredTeachers: any = [];
    if (typeof s.TEACHERS === 'string') {
      try {
        const parsed = JSON.parse(s.TEACHERS);
        preferredTeachers = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Malformed TEACHERS value in syllabus:', s.TEACHERS, e);
        preferredTeachers = [];
      }
    } else if (Array.isArray(s.TEACHERS)) {
      preferredTeachers = s.TEACHERS;
    } else {
      preferredTeachers = [];
    }
    if (preferredTeachers.length === 0) return null;

    const result = lessonsFilteredBySubjects.filter(
      (l) => l.teacherId && !preferredTeachers.map(Number).includes(Number(l.teacherId))
    );
    if (result.length === 0) return null;

    myError.num = result.length;
    return myError;
  },
  speciality: (s) => {
    // Check if the subject exists in the subjects collection
    const subject = subjects[s.SUBJECT_ID as keyof typeof subjects];
    if (!subject) return null; // Subject doesn't exist, can't validate

    const preferredSpeciality = subject.SPECIALTY_ID?.toString() || null;
    if (preferredSpeciality === null) return null;

    const result = lessonsFilteredBySubjects.filter((l) => {
      // Make sure we have a valid classroom ID and it exists in our classRooms collection
      if (!l.classRoomId) return false;
      const classroom = classRooms[l.classRoomId?.toString() as string];
      if (!classroom) return false;
      
      return classroom.SPECIALITY_ID?.toString() !== preferredSpeciality;
    });
    
    if (result.length === 0) return null;

    const myError = {...specilityError};
    myError.num = result.length;
    return myError;
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
      (l) => l.subjectId == s.SUBJECT_ID
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
