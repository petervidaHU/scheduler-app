import { ID, Timeslots } from "./databaseTypes";

export interface PreloadDataObject<D> {
    error?: boolean,
    isLoading?: boolean,
    data?: D,
}

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
    timeslotId: ID;
    teacherId: Array<number> | null;
    classRoomId: ID | null;
    subjectId: ID;
    classId: ID;
    id: number;
    frameId: ID | 'CUSTOM';
    dayId: ID | string;
}

export interface ManageFormServerProps {
    backBtnUrl: string,
    backBtnText: string,
    submitBtnText: string,
    toastMessage: string
}