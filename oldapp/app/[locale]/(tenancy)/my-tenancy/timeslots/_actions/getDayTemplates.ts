import { getDbInstance } from "@/lib/database/db-instance";
import { DayTemplates } from "@/types/databaseTypes";

export const getDayTemplates = async (): Promise<Array<DayTemplates>> => {
    try {
        const db = await getDbInstance();
        const result = await db.getDayTemplatesByTenancy();
        return result;
    } catch (error) {
        console.error(`Error getting day templates: ${error}`);
        return [];
    }
}