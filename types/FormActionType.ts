import { ID } from "./databaseTypes";

export interface FormActionType {
    error: any,
    data: null | any,
    success: boolean,
    message?: string,
    pending?: boolean
}

export interface SelectOptions {
    label: string,
    value: string
}

export interface SyllabusInputForm {
    occurence: number;
    teachers: ID[];
    subject: ID;
}

export interface LessonInput {
    timeslot: ID;
    day: ID;
    teacher: ID;
    classroom: ID | null;
    subject: ID;
    classId: ID;
}