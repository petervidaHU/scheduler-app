import {
  Classes,
  ClassRoom,
  ID,
  Specialty,
  Subject,
  Syllabus,
  Teacher,
  Timeslots,
} from "./databaseTypes";
import { LessonInput, PreloadDataObject, SelectOptions, SyllabusInputForm } from "./FormActionType";

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
  timeSlots: Array<{timeslotId: number, lessonId?: string}>;
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
  // timeslots: Record<string, Timeslots>;
  days: DayPlan[];
}

export type SyllabusSubjectWithOptions = Syllabus & SelectOptions;

export type SyllabusFormProperties = {
  teachers: Array<number>;
  occurrence: number;
}

export type SyllabusForm = {
  classId: ID;
  subjects: Record<ID, SyllabusFormProperties>;
};

// TODO turn key: string to key: ID
export interface DataWithOptions<T> {
  [key: string]: T & SelectOptions;
}
 
export interface TenancyBasedData {
  teachers: PreloadDataObject<DataWithOptions<Teacher>>;
  classRooms: PreloadDataObject<DataWithOptions<ClassRoom>>;
  subjects: PreloadDataObject<DataWithOptions<Subject>>;
  specialties: PreloadDataObject<DataWithOptions<Specialty>>;
  classes: PreloadDataObject<DataWithOptions<Classes>>;
}
