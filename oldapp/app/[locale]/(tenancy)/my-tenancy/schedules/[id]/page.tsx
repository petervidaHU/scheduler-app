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
import { Syllabus } from "@/types/databaseTypes";
import {
  DataWithOptions,
  DataWithOptionWithError,
} from "@/types/ScheduleTypes";
import { ResultHandler } from "@/components/HOC/ResultErrorHandler";

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

  // Pre-fetch syllabus if class is defined
  let syllabusResult: DataWithOptionWithError<Syllabus> = {
    data: null,
    error: null,
  };
  if (schedule.class) {
    syllabusResult = await getSyllabusAction(schedule.class);
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={2}>Edit Schedule: {schedule.name}</Title>
        <Link href="/en/my-tenancy/schedules">
          <Button variant="light">Back to List</Button>
        </Link>
      </Group>
      <ResultHandler error={syllabusResult.error}>
        <CreateSchedule
          scheduleId={scheduleId}
          scheduleData={schedule}
          syllabusData={syllabusResult}
          formTitle="Edit a new schedule"
          formDescription="Edit the details below."
          submitBtnText="Update"
          backBtnText="Back"
          backBtnUrl="/en/my-tenancy/schedules"
        />
      </ResultHandler>
      <SyllabusTable />
      <SchedulePlanner
        dayTemplates={dayTemplates}
        timeslots={timeslots}
        scheduleData={schedule}
      />
    </div>
  );
}
