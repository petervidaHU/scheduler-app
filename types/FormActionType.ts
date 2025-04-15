import { ID, Timeslots } from "./databaseTypes";

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
    timeslot: Timeslots;
    day: ID;
    teacher: {label: string, id: ID};
    classRoom: {label: string, id: ID} | null;
    subject: {label: string, id: ID};
    classId: ID;
    tempId: string;
}

export interface ManageFormServerProps<T> {
    entity: T,
    backBtnUrl: string,
    backBtnText: string,
    submitBtnText: string,
    toastMessage: string
}