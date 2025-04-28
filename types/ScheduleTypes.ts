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
import { LessonInput, PreloadDataObject, SelectOptions } from "./FormActionType";

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

export type SyllabusSubjectWithOptions = Syllabus & SelectOptions;

export type SyllabusForm = {
  classId: ID;
  subjects: {
    [key: string]: SyllabusSubjectWithOptions;
  };
};

export interface DataWithOptions<T> {
  [key: string]: T & SelectOptions;
}
 
export interface TenancyBasedData {
  teachers: PreloadDataObject<DataWithOptions<Teacher>>;
  classRooms: PreloadDataObject<DataWithOptions<ClassRoom>>;
  subjects: PreloadDataObject<DataWithOptions<Subject>>;
  specialities: PreloadDataObject<DataWithOptions<Specialty>>;
  classes: PreloadDataObject<DataWithOptions<Classes>>;
  timeslots: Timeslots[];
}
