import CreateSchedule from "@/components/forms/CreateSchedule";
import SyllabusTable from "@/components/syllabus-table/SyllabusTable";
import SchedulePlanner from "@/components/SchedulePlanner";
import { getDayTemplates } from "../../timeslots/_actions/getDayTemplates";
import { getTimeslots } from "../_actions/getTimeslots";

export default async function NewSchedulePage() {
  const dayTemplates = await getDayTemplates();
  const timeslots = await getTimeslots();

  return (
    <div>
      <CreateSchedule
        formTitle="Create a new schedule"
        formDescription="Fill in the details below to create a new schedule."
        submitBtnText="Create"
        backBtnText="Back"
        backBtnUrl="/en/my-tenancy/schedules"
      />
      <SyllabusTable />
      <SchedulePlanner dayTemplates={dayTemplates} timeslots={timeslots} />
    </div>
  );
}
