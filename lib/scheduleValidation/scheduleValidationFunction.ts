import { BadgeContexts } from "@/components/UI-elements/NotificationBadges";
import { UIFeedbackType } from "@/types/UIFeedbackTypes";

export interface ErrorObject {
  key?: string;
  message: string;
  type: UIFeedbackType;
  context: BadgeContexts;
  num: number;
}

export type ScheduleValidationTypes = 'speciality' | 'teacher' | 'capacity' | 'occurence'

export type ScheduleValidation = {
    [key in ScheduleValidationTypes]: ErrorObject;
};

const specilityError: ErrorObject = {
  message: "Speciality does not match",
  type: "warning",
  context: "classroom",
  num: 0,
};

const teacherError: ErrorObject = {
  message: "Teacher does not match",
  type: "warning",
  context: "teacher",
  num: 0,
};

const capacityError: ErrorObject = {
  message: "Capacity does not match",
  type: "error",
  context: "classroom",
  num: 0,
};

const occurenceError: ErrorObject = {
  message: "occurence does not match",
  type: "error",
  context: "default",
  num: 0, 
}


export const scheduleValidateObject: ScheduleValidation = {
    speciality: specilityError,
    teacher: teacherError,
    capacity: capacityError,
    occurence: occurenceError,
}