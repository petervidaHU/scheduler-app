import db from "@/lib/database/bd-instance";
import {
  Speciality,
  ClassRoom,
  Classes,
  Teacher,
  Timeslots,
  Subject,
} from "@/types/databaseTypes";
import { dataFetcherAll } from "../dashboarDataFetcher";
import CreateSchedule from "@/components/forms/CreateSchedule";
import SchedulePlanner from "@/components/SchedulePlanner";
import SyllabusTable from "@/components/forms/SyllabusTable";

export default async function SchedulesPage() {
  const [specialities, subjects, classRooms, classes, teachers, timeslots] =
    await Promise.all([
      dataFetcherAll<Speciality>(db.getAllSpeciality),
      dataFetcherAll<Subject>(db.getAllSubjects),
      dataFetcherAll<ClassRoom>(db.getAllClassRooms),
      dataFetcherAll<Classes>(db.getAllClasses),
      dataFetcherAll<Teacher>(db.getAllTeachers),
      dataFetcherAll<Timeslots>(() => db.getBasicTimeSlots("HUN1")),
    ]);

  if (
    classRooms.error ||
    classes.error ||
    teachers.error ||
    timeslots.error ||
    specialities.error ||
    subjects.error
  ) {
    return (
      <div>
        <h1>Error fetching data</h1>
        <p>{classRooms.error}</p>
        <p>{classes.error}</p>
        <p>{teachers.error}</p>
        <p>{timeslots.error}</p>
        <p>{specialities.error}</p>
      </div>
    );
  }

  const subjectOptions = subjects.data.map((subject) => ({
    value: subject.SUBJECT_ID.toString(),
    label: subject.SUBJECT_NAME,
  }));

  const teacherOptions = teachers.data.map((teacher) => ({
    value: teacher.TEACHER_ID.toString(),
    label: teacher.TEACHER_NAME,
  }));

  const classRoomOptions = classRooms.data.map((classRoom) => ({
    value: classRoom.CLASSROOM_ID.toString(),
    label: classRoom.CLASSROOM_NAME,
  }))
  return (
    <div>
      <h1>Schedules</h1>
      <CreateSchedule
        data={{
          specialities: specialities.data,
          classRooms: classRooms.data,
          classes: classes.data,
          teachers: teachers.data,
          subjects: subjects.data,
          classRoomOptions,
          teacherOptions,
          subjectOptions
        }}
      />
      <SyllabusTable
      />
      <SchedulePlanner basicTimeslots={timeslots.data} />
    </div>
  );
}
