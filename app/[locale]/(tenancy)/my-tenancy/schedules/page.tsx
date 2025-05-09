import { getDbInstance } from "@/lib/database/db-instance";
import Link from "next/link";
import { Button, Table, Title } from "@mantine/core";

interface Schedule {
  ID: number;
  NAME: string;
  CLASS_ID: number;
  CLASS_NAME?: string;
  OWNER: string;
  STATUS?: string;
}

export default async function SchedulesPage() {
  // Fetch all schedules for this tenancy
  const db = await getDbInstance();
  const schedules = await db.getSchedules() as Schedule[];
 
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title>Schedules</Title>
        <Link href="/en/my-tenancy/schedules/new">
          <Button>Create New Schedule</Button>
        </Link>
      </div>

      {schedules && schedules.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule: Schedule) => (
              <tr key={schedule.ID}>
                <td>{schedule.NAME}</td>
                <td>{schedule.CLASS_NAME || schedule.CLASS_ID}</td>
                <td>{schedule.OWNER}</td>
                <td>{schedule.STATUS || 'DRAFT'}</td>
                <td>
                  <Link href={`/en/my-tenancy/schedules/${schedule.ID}`}>
                    <Button variant="light" size="xs" mr="xs">Edit</Button>
                  </Link>
                  <Link href={`/en/my-tenancy/schedules/view/${schedule.ID}`}>
                    <Button variant="light" size="xs">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="text-center p-6">
          <p className="mb-4">No schedules found</p>
        </div>
      )}
    </div>
  );
}
