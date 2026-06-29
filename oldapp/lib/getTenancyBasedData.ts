"use server";
import { dataFetcherAll } from "@/app/[locale]/(tenancy)/my-tenancy/dashboarDataFetcher";
import { getDbInstance } from "./database/db-instance";
import {
  Specialty,
  Subject,
  ClassRoom,
  Classes,
  Teacher,
  Frame,
} from "@/types/databaseTypes";
import { TenancyBasedData } from "@/types/ScheduleTypes";
import { dataObjectCreator } from "./dataObjectCreator";
import { Entities } from "@/types/Entities";

export const getTenancyBasedData = async (): Promise<TenancyBasedData> => {
  const db = await getDbInstance();
  const [specialties, subjects, classRooms, classes, teachers, frames] =
    await Promise.all([
      dataFetcherAll<Specialty>(db.getAllEntity, Entities.specialty),
      dataFetcherAll<Subject>(db.getAllEntity, Entities.subject),
      dataFetcherAll<ClassRoom>(db.getAllEntity, Entities.classroom),
      dataFetcherAll<Classes>(db.getAllEntity, Entities.class),
      dataFetcherAll<Teacher>(db.getAllEntity, Entities.teacher),
      dataFetcherAll<Frame>(db.getAllEntity, Entities.frame),
    ]);

  if (
    specialties.error ||
    subjects.error ||
    classRooms.error ||
    classes.error ||
    teachers.error ||
    frames.error
  ) {
    throw new Error(
      `Error getting tenancy based data:,  ${
        (specialties.error,
        subjects.error,
        classRooms.error,
        classes.error,
        teachers.error,
        frames.error)}`
    );
  }

  const teachersObject = dataObjectCreator(teachers.data);
  const classRoomsObject = dataObjectCreator(classRooms.data);
  const subjectsObject = dataObjectCreator(subjects.data);
  const specialitiesObject = dataObjectCreator(specialties.data);
  const classesObject = dataObjectCreator(classes.data);
  const framesObject = dataObjectCreator(frames.data);

  return {
    specialties: {data: specialitiesObject},
    subjects: {data: subjectsObject},
    teachers: {data: teachersObject},
    classRooms: {data: classRoomsObject},
    classes: {data: classesObject},
    frames: {data: framesObject},
  };
};
