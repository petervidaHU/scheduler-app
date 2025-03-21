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
    TEACHER_EMAIL: string;
    DESCRIPTION: string;
}

export interface Subject {
    SUBJECT_ID: ID;
    SUBJECT_NAME: string;
    DESCRIPTION: string;
    SPECIALITY_ID: ID;
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

export interface Class {
    CLASS_ID: ID;
    CLASS_NAME: string;
    NUMBER_OF_STUDENTS: number;
}
