import db from "@/lib/database/bd-instance";
import { Speciality, ClassRoom, Classes, Teacher, Timeslots } from "@/types/databaseTypes";
import { dataFetcherAll } from "../dashboarDataFetcher";
import CreateSchedule from "@/components/forms/CreateSchedule";
import SchedulePlanner from "@/components/SchedulePlanner";

export default async function SchedulesPage() {
    const [specialities, classRooms, classes, teachers, timeslots] = await Promise.all([
        dataFetcherAll<Speciality>(db.getAllSpeciality),
        dataFetcherAll<ClassRoom>(db.getAllClassRooms),
        dataFetcherAll<Classes>(db.getAllClasses),
        dataFetcherAll<Teacher>(db.getAllTeachers),
        dataFetcherAll<Timeslots>(() => db.getBasicTimeSlots('HUN1')),
      ])
      console.log('all dat ain schedule page server side:', timeslots )
      if (classRooms.error || classes.error ||  teachers.error || timeslots.error) {
        return (
          <div>
            <h1>Error fetching data</h1>
            <p>{classRooms.error}</p>
            <p>{classes.error}</p>
            <p>{teachers.error}</p>
          </div>
        );
      }
    return (
        <div>
            <h1>Schedules</h1>
            <CreateSchedule data={{
                classRooms: classRooms.data,
                classes: classes.data,
                teachers: teachers.data
            }}/>
            <SchedulePlanner basicTimeslots={timeslots.data}/>
        </div>
    );
}