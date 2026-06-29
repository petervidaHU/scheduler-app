import { getDbInstance } from "@/lib/database/db-instance";

export const getTimeslots = async () => {
    try {
        const db = await getDbInstance();
        const result = await db.getBasicTimeSlots();
        return result;
    } catch (error) {
        console.error(`Error getting timeslots: ${error}`);
        throw error;
    }
}