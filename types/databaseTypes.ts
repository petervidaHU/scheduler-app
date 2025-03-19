export type ID = number | string;

export interface QueryResult {
    rows: any[];
    metadata: any[];
}

export interface Tenancy {
    SCHOOL_ID: ID;
    SCHOOL_NAME: string;
}

export interface Teacher {
    TEACHER_ID: ID;
    TEACHER_NAME: string;
}

export interface Subject {
    SUBJECT_ID: ID;
    SUBJECT_NAME: string;
}

export interface Speciality {
    SPECIALTY_ID: ID;
    SPECIALTY_NAME: string;
}

export interface ClassRoom {
    CLASSROOM_ID: ID;
    CLASSROOM_NAME: string;
}

export interface Class {
    CLASS_ID: ID;
    CLASS_NAME: string;
}
