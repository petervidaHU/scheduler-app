import {
  Classes,
  ClassRoom,
  ID,
  Specialty,
  Subject,
  Syllabus,
  Teacher,
  Timeslots,
  Frame,
} from "./databaseTypes";
import {
  LessonInput,
  PreloadDataObject,
  SelectOptions,
  SyllabusInputForm,
} from "./FormActionType";

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
  timeSlots: Array<{ timeslotId: number; lessonId?: string }>;
  lessons: Array<string>;
  templateId?: string;
  scheduleId?: string; // Add this to track which schedule a day belongs to
  customTimeslots?: Array<Timeslots>;
}

export interface Schedule {
  id: string;
  [FormFields.name]: string | null;
  [FormFields.status]: SStatus | null;
  [FormFields.class]: ID | null;
  [FormFields.description]: string | null;
  [FormFields.owner]: ID | null;
  frameId: ID | "CUSTOM" | null;
  lessons: Record<string, LessonInput>;
  // timeslots: Record<string, Timeslots>;
  days: DayPlan[];
}

export type SyllabusSubjectWithOptions = Syllabus & SelectOptions;

export type SyllabusFormProperties = {
  teachers: Array<number>;
  occurrence: number;
};

export type SyllabusForm = {
  classId: ID;
  subjects: Record<ID, SyllabusFormProperties>;
};

export type SyllabusWithOptions = {
  [subjectId: string]: {
    value: string;
    label: string;
    ID: ID;
    CLASS_ID: ID;
    SUBJECT_ID: ID;
    TEACHERS: ID[];
    TENANCY_ID: ID;
    OCCURRENCE: number;
  };
};

// TODO turn key: string to key: ID
export interface DataWithOptions<T> {
  [key: string]: T & SelectOptions;
}

export interface DataWithOptionWithError<T> {
  data: DataWithOptions<T> | null;
  error: string | null;
}

export interface TenancyBasedData {
  teachers: PreloadDataObject<DataWithOptions<Teacher>>;
  classRooms: PreloadDataObject<DataWithOptions<ClassRoom>>;
  subjects: PreloadDataObject<DataWithOptions<Subject>>;
  specialties: PreloadDataObject<DataWithOptions<Specialty>>;
  classes: PreloadDataObject<DataWithOptions<Classes>>;
  frames: PreloadDataObject<DataWithOptions<Frame>>;
}

export type TimeslotLessonInput = {
  classId?: number;
  subjectId?: number;
  teacherId?: Array<number> | null;
  classRoomId?: number | null;
  id?: number;
};

export interface OccupiedTimeslot {
  CLASSROOM_ID: number;
  CLASS_ID: number;
  CLASS_NAME: string;
  DAYS_ID: number;
  FRAME_ID: number;
  ID: number;
  PERIOD_END: number;
  PERIOD_START: number;
  SCHEDULE_ID: number;
  SLOT_ORDER: number;
  SUBJECT_ID: number;
  TEACHERS: string;
  TEMPLATE_ID: number;
  TENANCY_ID: number;
  TIMESLOT_NAME: string | null;
}
