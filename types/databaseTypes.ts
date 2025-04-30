export type ID = number;

export interface QueryResult {
    rows: any[];
    metadata: any[];
}

export interface Tenancy {
    ID: ID;
    NAME: string;
}

export interface GetTenancyByUserResult {
    TENANCY_ID: number,
    TENANCY_NAME: string,
    ROLE_ID: number,
    ROLE_NAME: string,
}

export interface Teacher {
    ID: ID;
    NAME: string;
    EMAIL: string;
    DESCRIPTION: string;
}

export interface Subject {
    ID: ID;
    NAME: string;
    DESCRIPTION: string;
    SPECIALTY_ID: ID;
    HELPER_COLOR?: string;
}

export interface Specialty {
    ID: ID;
    NAME: string;
    DESCRIPTION: string;
}

export interface ClassRoom {
    ID: ID;
    NAME: string;
    CAPACITY: number;
    SPECIALITY_ID: ID;
    DESCRIPTION: string;
}

export interface Classes {
    ID: ID;
    NAME: string;
    NUMBER_OF_STUDENTS: number;
}

export interface Timeslots {
    ID: ID;
    NAME: string;
    PERIOD_START: number;
    PERIOD_END: number;
    TENANCY_ID: ID | null;
    DESCRIPTION: string;
}

export interface Lesson {
    TIMESLOT_ID: ID;
    TENANCY_ID: ID;
    TEACHER_ID: ID;
    SUBJECT_ID: ID;
    CLASS_ID: ID;
    CLASSROOM_ID: ID;
    TEMPLATE_ID: ID;
}

export interface Syllabus {
    ID: ID;
    CLASS_ID: ID;
    SUBJECT_ID: ID;
    TEACHER_ID: ID | null;
    TENANCY_ID: ID;
    OCCURRENCE: number;
}

export type GlobalTimeslot= 'HUN1';

export interface ErrorResponse {
    error: string;
}