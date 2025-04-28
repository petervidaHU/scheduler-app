export type ID = number;

export interface QueryResult {
    rows: any[];
    metadata: any[];
}

export interface Tenancy {
    SCHOOL_ID: ID;
    SCHOOL_NAME: string;
}

export interface GetTenancyByUserResult {
    TENANCY_ID: number,
    TENANCY_NAME: string,
    ROLE_ID: number,
    ROLE_NAME: string,
}

export interface Teacher {
    TEACHER_ID: ID;
    TEACHER_NAME: string;
    TEACHER_EMAIL: string;
    DESCRIPTION: string;
}

export interface Subject {
    SUBJECT_ID: ID;
    SUBJECT_NAME: string;
    DESCRIPTION: string;
    SPECIALTY_ID: ID;
    HELPER_COLOR?: string;
}

export interface Speciality {
    SPECIALTY_ID: ID;
    SPECIALTY_NAME: string;
    DESCRIPTION: string;
}

export interface ClassRoom {
    CLASSROOM_ID: ID;
    CLASSROOM_NAME: string;
    CAPACITY: number;
    SPECIALITY_ID: ID;
}

export interface Classes {
    CLASS_ID: ID;
    CLASS_NAME: string;
    NUMBER_OF_STUDENTS: number;
}

export interface Timeslots {
    TEMPLATE_ID: ID;
    NAME: string;
    PERIOD_START: string;
    PERIOD_END: string;
    TENANCY_ID: ID | null;
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
    SYLLABUS_ID: ID;
    CLASS_ID: ID;
    SUBJECT_ID: ID;
    TEACHER_ID: ID | null;
    TENANCY_ID: ID;
    OCCURRENCE: number;
}

export type GlobalTimeslot= 'HUN1';