import CreateSchedule from "@/components/forms/CreateSchedule";
import SchedulePlanner from "@/components/SchedulePlanner";
import SyllabusTable from "@/components/forms/SyllabusTable";

export default async function SchedulesPage() {
 
  return (
    <div>
      <h1>Schedules</h1>
      <CreateSchedule />
      <SyllabusTable />
      <SchedulePlanner />
    </div>
  );
}
