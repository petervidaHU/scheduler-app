import CreateSchedule from "@/components/forms/CreateSchedule";
import SyllabusTable from "@/components/syllabus-table/SyllabusTable";
import SchedulePlanner from "@/components/SchedulePlanner";
import { getDayTemplates } from "../../timeslots/_actions/getDayTemplates";
import { getTimeslots } from "../_actions/getTimeslots";
import { Button, Group, Title } from "@mantine/core";
import Link from "next/link";

export default async function NewSchedulePage() {
  const dayTemplates = await getDayTemplates();
  const timeslots = await getTimeslots();
 
  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={2}>Create New Schedule</Title>
        <Link href="/en/my-tenancy/schedules">
          <Button variant="light">Back to List</Button>
        </Link>
      </Group>
      <CreateSchedule />
      <SyllabusTable />
      <SchedulePlanner dayTemplates={dayTemplates} timeslots={timeslots} />
    </div>
  );
} 