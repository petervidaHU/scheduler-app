import { getDbInstance } from "@/lib/database/db-instance";

interface Schedule {
  ID: number;
  NAME: string;
  CLASS_ID: number;
  CLASS_NAME?: string;
  OWNER: string;
  STATUS?: string;
}

import SchedulesTableClient from "./SchedulesTableClient";

export default async function SchedulesPage() {
  // Fetch all schedules for this tenancy
  const db = await getDbInstance();
  const schedules = await db.getSchedules() as Schedule[];

  return <SchedulesTableClient schedules={schedules} />;
}
