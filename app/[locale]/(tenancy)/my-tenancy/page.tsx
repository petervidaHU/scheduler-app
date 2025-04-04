import React from "react";
import { NoRoleContent } from "./NoRoleContent";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { Classes, ClassRoom, Speciality, Subject, Teacher } from "@/types/databaseTypes";
import TabsWithTable from "@/components/TabsWithTable";
import { dataFetcherAll } from "./dashboarDataFetcher";
import { TableData } from "@mantine/core";
import { Entities } from "@/types/Entities";
import { getDbInstance } from "@/lib/database/db-instance";

const tableDataMapper = (data: any[]): TableData => {
  const head: string[] = Object.keys(data[0] || []);
  const body: any[] = data.map(row => Object.values(row));
  return {
    head,
    body,
  }
}

export default async function MyTenancyPage() {
  const db = await getDbInstance();
  const { tenancyId, userRole } = await getAuth();

  const [specialities, classRooms, classes, teachers, subjects] = await Promise.all([
    dataFetcherAll<Speciality>(db.getAllSpeciality),
    dataFetcherAll<ClassRoom>(db.getAllClassRooms),
    dataFetcherAll<Classes>(db.getAllClasses),
    dataFetcherAll<Teacher>(db.getAllTeachers),
    dataFetcherAll<Subject>(db.getAllSubjects),
  ])


  const tabsData = [
    {
      label: Entities.speciality,
      error: specialities.error,
      data: tableDataMapper(specialities.data),
    },
    {
      label: Entities.classroom,
      error: classRooms.error,
      data: tableDataMapper(classRooms.data),
    },
    {
      label: Entities.class,
      error: classes.error,
      data: tableDataMapper(classes.data),
    },
    {
      label: Entities.teacher,
      error: teachers.error,
      data: tableDataMapper(teachers.data),
    },
    {
      label: Entities.subject,
      error: subjects.error,
      data: tableDataMapper(subjects.data),
    }, 
  ];

  if (!userRole || userRole === "norole") {
    return <NoRoleContent tenancyId={tenancyId || ""} />;
  }

  return (
    <div>
      <h1>My Tenancy Page</h1>
      <h2>Role: {userRole}</h2>
      <h2>tenancyId: {tenancyId}</h2>
      <TabsWithTable tabs={tabsData} />
    </div>
  );
}
