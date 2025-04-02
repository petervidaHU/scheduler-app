"use server";

import db from "@/lib/database/bd-instance";
import { FormActionType, LessonInput } from "@/types/FormActionType";

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
    const result = db.createLesson(props)

    return {
        ...state,
        success: true,
        error: null,
    };
};