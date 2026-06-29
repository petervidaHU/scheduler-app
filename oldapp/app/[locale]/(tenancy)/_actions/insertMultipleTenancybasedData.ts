"use server"

import { getDbInstance } from "@/lib/database/db-instance";
import { Entities } from "@/types/Entities";
import { DataWithOptions } from "@/types/ScheduleTypes";

const keyColumnMapping = {
    [Entities.specialty]: ['NAME', 'TENANCY_ID', 'DESCRIPTION'], 
    [Entities.subject]: ['NAME', 'TENANCY_ID', 'SPECIALTY_ID', 'DESCRIPTION', 'HELPER_COLOR'],
}

export const insertMultipleTenancyBasedData = async (
        label: Entities.specialty | Entities.subject,
        data: DataWithOptions<any>[],
) => {
    const db = await getDbInstance();
    const result = await db.insertMultipleTenancyBasedData(label, keyColumnMapping[label], data);
    return result;
}