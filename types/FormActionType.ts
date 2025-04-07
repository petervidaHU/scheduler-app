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
    occurrence: number;
    teachers: ID[];
    subject: ID;
}

export interface LessonInput {
    timeslot: ID;
    day: ID;
    teacher: ID;
    classRoom: ID | null;
    subject: ID;
    classId: ID;
}

export interface ManageFormServerProps<T> {
    entity: T,
    backBtnUrl: string,
    backBtnText: string,
    submitBtnText: string,
    toastMessage: string
}