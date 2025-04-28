"use server";
import { dataFetcherAll } from "@/app/[locale]/(tenancy)/my-tenancy/dashboarDataFetcher";
import { getDbInstance } from "./database/db-instance";
import {
  Specialty,
  Subject,
  ClassRoom,
  Classes,
  Teacher,
  Timeslots,
} from "@/types/databaseTypes";
import { DataWithOptions, TenancyBasedData } from "@/types/ScheduleTypes";

export const getTenancyBasedData = async (): Promise<TenancyBasedData> => {
  const db = await getDbInstance();
  const [specialities, subjects, classRooms, classes, teachers, timeslots] =
    await Promise.all([
      dataFetcherAll<Specialty>(db.getAllSpeciality),
      dataFetcherAll<Subject>(db.getAllSubjects),
      dataFetcherAll<ClassRoom>(db.getAllClassRooms),
      dataFetcherAll<Classes>(db.getAllClasses),
      dataFetcherAll<Teacher>(db.getAllTeachers),
      dataFetcherAll<Timeslots>(() => db.getBasicTimeSlots("HUN1")),
    ]);

  if (
    specialities.error ||
    subjects.error ||
    classRooms.error ||
    classes.error ||
    teachers.error ||
    timeslots.error
  ) {
    throw new Error(
      `Error getting tenancy based data:,  ${
        (specialities.error,
        subjects.error,
        classRooms.error,
        classes.error,
        teachers.error,
        timeslots.error)
      }`
    );
  }

  const teachersObject = teachers.data.reduce((acc, teacher) => {
    acc[teacher.ID] = {
      value: teacher.ID.toString(),
      label: teacher.NAME,
      ...teacher,
    };
    return acc;
  }, {} as DataWithOptions<Teacher>);

  const classRoomsObject = classRooms.data.reduce((acc, classRoom) => {
    acc[classRoom.ID] = {
      value: classRoom.ID.toString(),
      label: classRoom.NAME,
      ...classRoom,
    };
    return acc;
  }, {} as DataWithOptions<ClassRoom>);

  const subjectsObject = subjects.data.reduce((acc, subject) => {
    acc[subject.ID] = {
      value: subject.ID.toString(),
      label: subject.NAME,
      ...subject,
    };
    return acc;
  }, {} as DataWithOptions<Subject>);

  const specialitiesObject = specialities.data.reduce((acc, speciality) => {
    acc[speciality.ID] = {
      value: speciality.ID.toString(),
      label: speciality.NAME,
      ...speciality,
    };
    return acc;
  }, {} as DataWithOptions<Specialty>);

  const classesObject = classes.data.reduce((acc, classItem) => {
    acc[classItem.ID] = {
      value: classItem.ID.toString(),
      label: classItem.NAME,
      ...classItem,
    };
    return acc;
  }, {} as DataWithOptions<Classes>);

  return {
    specialities: {data: specialitiesObject},
    subjects: {data: subjectsObject},
    teachers: {data: teachersObject},
    classRooms: {data: classRoomsObject},
    classes: {data: classesObject},
    timeslots: timeslots.data,
  };
};
