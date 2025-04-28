"use server";
import { dataFetcherAll } from "@/app/[locale]/(tenancy)/my-tenancy/dashboarDataFetcher";
import { getDbInstance } from "./database/db-instance";
import {
  Speciality,
  Subject,
  ClassRoom,
  Classes,
  Teacher,
  Timeslots,
} from "@/types/databaseTypes";
import { DataWithOptions, TenancyBasedData } from "@/types/ScheduleTypes";
import { FormActionType } from "@/types/FormActionType";

export const getTenancyBasedData = async (): Promise<TenancyBasedData> => {
  const db = await getDbInstance();
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
    acc[teacher.TEACHER_ID] = {
      value: teacher.TEACHER_ID.toString(),
      label: teacher.TEACHER_NAME,
      ...teacher,
    };
    return acc;
  }, {} as DataWithOptions<Teacher>);

  const classRoomsObject = classRooms.data.reduce((acc, classRoom) => {
    acc[classRoom.CLASSROOM_ID] = {
      value: classRoom.CLASSROOM_ID.toString(),
      label: classRoom.CLASSROOM_NAME,
      ...classRoom,
    };
    return acc;
  }, {} as DataWithOptions<ClassRoom>);

  const subjectsObject = subjects.data.reduce((acc, subject) => {
    acc[subject.SUBJECT_ID] = {
      value: subject.SUBJECT_ID.toString(),
      label: subject.SUBJECT_NAME,
      ...subject,
    };
    return acc;
  }, {} as DataWithOptions<Subject>);

  const specialitiesObject = specialities.data.reduce((acc, speciality) => {
    acc[speciality.SPECIALTY_ID] = {
      value: speciality.SPECIALTY_ID.toString(),
      label: speciality.SPECIALTY_NAME,
      ...speciality,
    };
    return acc;
  }, {} as DataWithOptions<Speciality>);

  const classesObject = classes.data.reduce((acc, classItem) => {
    acc[classItem.CLASS_ID] = {
      value: classItem.CLASS_ID.toString(),
      label: classItem.CLASS_NAME,
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
