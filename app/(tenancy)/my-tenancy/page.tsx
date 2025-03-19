import React from "react";
import { NoRoleContent } from "./NoRoleContent";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { Roles } from "@/types/UserTypes";
import db from "@/lib/database/bd-instance";
import { Class, ClassRoom, Speciality } from "@/types/databaseTypes";
import TabsWithTable from "@/components/TabsWithTable";

export default async function MyTenancyPage() {
  const { tenancyId, userRole } = await getAuth();
  const specialities: Speciality[] = [];
  const classRooms: ClassRoom[] = [];
  const classes: Class[] = [];
  const teachers: any[] = [];

  // DATA FETCHING
  try {
    const specials = await db.getAllSpeciality();
    if (specials.length > 0) {
      specialities.push(...specials);
    }
  } catch (error) {
    console.error("Error fetching specialities:", error);
  }

  try {
    const classrooms = await db.getAllClassRooms();
    if (classrooms.length > 0) {
      classRooms.push(...classrooms);
    }
  } catch (error) {
    console.error("Error fetching classRooms:", error);
  }

  try {
    const classes = await db.getAllClasses();
    if (classes.length > 0) {
      classes.push(...classes);
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
  }

  console.log("classRooms", classRooms);
  console.log("specialities", specialities);
  console.log("userRole", userRole);
  console.log("classes", classes);

  const tabsData = [
    {
      label: "specialities",
      data: specialities.map((spec) => ({
        name: spec.SPECIALTY_NAME,
        id: spec.SPECIALTY_ID,
      })),
    },
    {
      label: "classRooms",
      data: classRooms.map((croom) => ({
        name: croom.CLASSROOM_NAME,
        id: croom.CLASSROOM_ID,
      })),
    },
    {
      label: "classes",
      data: classes.map((c) => ({
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
