import CreateSchedule from "@/components/forms/CreateSchedule";
import SchedulePlanner from "@/components/SchedulePlanner";
import SyllabusTable from "@/components/syllabus-table/SyllabusTable";
import { getDayTemplates } from "../timeslots/_actions/getDayTemplates";
import { getTimeslots } from "./_actions/getTimeslots";

interface SchedulesPageProps {
  searchParams: {
    scheduleId?: string;
  };
}

export default async function SchedulesPage({ searchParams }: SchedulesPageProps) {
  const dayTemplates = await getDayTemplates();
  const timeslots = await getTimeslots();
  const { scheduleId } = searchParams;
 
  return (
    <div>
      <h1>{scheduleId ? "Edit Schedule" : "Create New Schedule"}</h1>
      <CreateSchedule scheduleId={scheduleId} />
      <SyllabusTable />
      <SchedulePlanner dayTemplates={dayTemplates} timeslots={timeslots}/>
    </div>
  );
}
