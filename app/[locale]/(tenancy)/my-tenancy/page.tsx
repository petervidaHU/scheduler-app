import React from "react";
import { NoRoleContent } from "./NoRoleContent";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { Classes, ClassRoom, Speciality, Subject, Teacher } from "@/types/databaseTypes";
import TabsWithTable from "@/components/TabsWithTable";
import { dataFetcherAll } from "./dashboarDataFetcher";
import { getDbInstance } from "@/lib/database/db-instance";

export default async function MyTenancyPage() {
  // const db = await getDbInstance();
  const { tenancyId, userRole } = await getAuth();
// TODO: implement stale while revalidate data fetching
/*   const [specialities, classRooms, classes, teachers, subjects] = await Promise.all([
    dataFetcherAll<Speciality>(db.getAllSpeciality),
    dataFetcherAll<ClassRoom>(db.getAllClassRooms),
    dataFetcherAll<Classes>(db.getAllClasses),
    dataFetcherAll<Teacher>(db.getAllTeachers),
    dataFetcherAll<Subject>(db.getAllSubjects),
  ]) */


 

  if (!userRole || userRole === "norole") {
    return <NoRoleContent tenancyId={tenancyId?.toString() || ""} />;
  }

  return (
    <div>
      <h1>My Tenancy Page</h1>
      <h2>Role: {userRole}</h2>
      <h2>tenancyId: {tenancyId}</h2>
      <TabsWithTable />
    </div>
  );
}
