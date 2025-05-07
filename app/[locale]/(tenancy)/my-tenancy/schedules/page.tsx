import CreateSchedule from "@/components/forms/CreateSchedule";
import SchedulePlanner from "@/components/SchedulePlanner";
import SyllabusTable from "@/components/syllabus-table/SyllabusTable";
import { getDayTemplates } from "../timeslots/_actions/getDayTemplates";
import { getTimeslots } from "./_actions/getTimeslots";

export default async function SchedulesPage() {
    const dayTemplates = await getDayTemplates();
    const timeslots = await getTimeslots();
 
  return (
    <div>
      <h1>Schedules</h1>
      <CreateSchedule />
      <SyllabusTable />
      <SchedulePlanner dayTemplates={dayTemplates} timeslots={timeslots}/>
    </div>
  );
}
