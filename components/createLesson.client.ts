import db from "@/lib/database/bd-instance";
import { ID, Timeslots } from "@/types/databaseTypes";
import { LessonInput } from "@/types/FormActionType";

export const createLesson = (props: LessonInput) => {
    const {
        timeslot,
        teacher,
        classroom,
        subject,
        classId,
        day, 
    } = props;
    if (timeslot && teacher && classroom && subject && classId && day) {
        return "error input";
    }
    const result = db.createLesson(props)

    return {};
};