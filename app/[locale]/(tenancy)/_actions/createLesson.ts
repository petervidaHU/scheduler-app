"use server";

import { getDbInstance } from "@/lib/database/db-instance";
import { FormActionType, LessonInput } from "@/types/FormActionType";

export const createLesson = async (state: FormActionType, props: LessonInput): Promise<FormActionType>  => {
    const {
        timeslot,
        teacher,
        classRoom,
        subject,
        classId,
        dayId: day,
        frameId 
    } = props;
    if (!timeslot || !classId || !day) {
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