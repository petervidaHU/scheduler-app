import { ID, Timeslots } from "./databaseTypes";
import { SelectOptions } from "./FormActionType";

export interface DayPlan {
  id: string;
  order: string;
  identifier: string;
  timeSlots: Timeslots[];
}

export interface SyllabusForm {
  subjects: Array<SelectOptions & {
    preferredTeacher: {value: string, label: string} | null;
    occurrence: number;
    speciality: {value: string, label: string} | null;
  }>;
}
