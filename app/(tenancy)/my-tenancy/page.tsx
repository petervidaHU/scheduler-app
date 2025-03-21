import React from "react";
import { NoRoleContent } from "./NoRoleContent";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import db from "@/lib/database/bd-instance";
import { Class, ClassRoom, Speciality } from "@/types/databaseTypes";
import TabsWithTable from "@/components/TabsWithTable";
import { dataFetcherAll } from "./dashboarDataFetcher";
import { error } from "console";

export default async function MyTenancyPage() {
  const { tenancyId, userRole } = await getAuth();

  const [specialities, classRooms, classes, teachers] = await Promise.all([
    dataFetcherAll<Speciality>(db.getAllSpeciality),
    dataFetcherAll<ClassRoom>(db.getAllClassRooms),
    dataFetcherAll<Class>(db.getAllClasses),
    dataFetcherAll<any>(db.getAllTeachers),
  ])

  const tabsData = [
    {
      label: "specialities",
      error: specialities.error,
      data: specialities.data.map((spec) => ({
        name: spec.SPECIALTY_NAME,
        id: spec.SPECIALTY_ID,
      })),
    },
    {
      label: "classRooms",
      error: classRooms.error,
      data: classRooms.data.map((croom) => ({
        name: croom.CLASSROOM_NAME,
        id: croom.CLASSROOM_ID,
      })),
    },
    {
      label: "classes",
      error: classes.error,
      data: classes.data.map((c) => ({
        name: c.CLASS_NAME,
        id: c.CLASS_ID,
      })),
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
