import {
  Classes,
  ClassRoom,
  ID,
  Speciality,
  Subject,
  Syllabus,
  Teacher,
  Timeslots,
} from "./databaseTypes";
import { LessonInput, SelectOptions } from "./FormActionType";

export type SStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export enum FormFields {
  class = "class",
  name = "name",
  description = "description",
  owner = "owner",
  status = "status",
}

export interface DayPlan {
  id: string;
  order: string;
  identifier: string;
  timeSlots: Array<{timeslotId: string, lessonId?: string}>;
  lessons: Array<string>;
}

export interface Schedule {
  id: string;
  [FormFields.name]: string | null;
  [FormFields.status]: SStatus | null;
  [FormFields.class]: ID | null;
  [FormFields.description]: string | null;
  [FormFields.owner]: ID | null;
  period: number | null;
  lessons: Record<string, LessonInput>;
  timeslots: Record<string, Timeslots>;
  days: DayPlan[];
}

export type SyllabusForm = {
  classId: ID;
  subjects: {
    [key: string]: Syllabus & SelectOptions;
  };
};

export interface DataWithOptions<T> {
  [key: string]: T & SelectOptions;
}

export interface TenancyBasedData {
  teachers: DataWithOptions<Teacher>;
  classRooms: DataWithOptions<ClassRoom>;
  subjects: DataWithOptions<Subject>;
  specialities: DataWithOptions<Speciality>;
  classes: DataWithOptions<Classes>;
  timeslots: Timeslots[];
}
