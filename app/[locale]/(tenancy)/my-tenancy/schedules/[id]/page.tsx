import CreateSchedule from "@/components/forms/CreateSchedule";
import SyllabusTable from "@/components/syllabus-table/SyllabusTable";
import SchedulePlanner from "@/components/SchedulePlanner";
import { getDayTemplates } from "../../timeslots/_actions/getDayTemplates";
import { getTimeslots } from "../_actions/getTimeslots";
import { Button, Group, Title } from "@mantine/core";
import { getScheduleById } from "../_actions/getScheduleById";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSyllabusAction } from "../_actions/getSyllabusAction";

interface SchedulePageProps {
  params: {
    id: string;
  };
}

export default async function EditSchedulePage({ params }: SchedulePageProps) {
  const scheduleId = params.id;
  const schedule = await getScheduleById(scheduleId);

  if (!schedule) {
    notFound();
  }

  const dayTemplates = await getDayTemplates();
  const timeslots = await getTimeslots();
  console.log('-----------------------------------------------')
  console.log('timesots in server page', timeslots);
  console.log('dayTemplates in server page', dayTemplates);
  console.log('schedule in server page', schedule);
  
  // Pre-fetch syllabus if class is defined
  let syllabus = null;
  if (schedule.class) {
    syllabus = await getSyllabusAction(schedule.class);
  }
  console.log('syllabus in server page', syllabus);
  console.log('-----------------------------------------------')

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={2}>Edit Schedule: {schedule.name}</Title>
        <Link href="/en/my-tenancy/schedules">
          <Button variant="light">Back to List</Button>
        </Link>
      </Group>
      <CreateSchedule
        scheduleId={scheduleId}
        scheduleData={schedule}
        syllabusData={syllabus}
      />
      <SyllabusTable />
      <SchedulePlanner
        dayTemplates={dayTemplates}
        timeslots={timeslots}
        scheduleData={schedule}
      />
    </div>
  );
}
