import { NotificationContexts } from "@/components/UI-elements/NotificationBadges";
import { UIFeedbackType } from "@/types/UIFeedbackTypes";

export interface ErrorObject {
  key?: string;
  message: string;
  type: UIFeedbackType;
  context: NotificationContexts;
  num: number;
}

export type ScheduleValidationTypes = 'speciality' | 'teacher' | 'capacity' | 'occurence'

export type ScheduleValidationResult = {
    [key in ScheduleValidationTypes]?: ErrorObject | null;
};
