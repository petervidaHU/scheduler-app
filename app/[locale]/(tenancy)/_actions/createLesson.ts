"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { FormActionType, LessonInput } from "@/types/FormActionType";
import { get } from "http";

export const createLesson = async (state: FormActionType, props: LessonInput): Promise<FormActionType>  => {
    const {
        timeslot,
        teacher,
        classroom,
        subject,
        classId,
        day, 
    } = props;
    if (!timeslot || !teacher || !classroom || !subject || !classId || !day) {
        return {
            ...state,
            error: "All fields are required",

        };
    }
    const db = await getDbInstance();
    const result = db.createLesson(props)

    return {
        ...state,
        success: true,
        error: null,
    };
};