import { ID, Timeslots } from "./databaseTypes";
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
  timeSlots: Timeslots[];
}

export interface Schedule {
  id: string;
  [FormFields.name]: string | null;
  [FormFields.status]: SStatus | null;
  [FormFields.class]: ID | null;
  [FormFields.description]: string | null;
  [FormFields.owner]: ID | null;
  period: number | null;
  lessons: LessonInput[];
}

export interface SyllabusForm {
  classId: ID;
  subjects: Array<
    SelectOptions & {
      preferredTeacher: { value: string; label: string } | null;
      occurrence: number;
      speciality: { value: string; label: string } | null;
    }
  >;
}
