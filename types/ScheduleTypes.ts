import { Timeslots } from "./databaseTypes";

export interface DayPlan {
    id: string;
    order: string;
    identifier: string;
    timeSlots: Timeslots[];
}