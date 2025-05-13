import React from "react";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { redirect } from "next/navigation";
import CreateSpeciality from "@/components/forms/CreateSpeciality";
import AdminClientComponent from "@/components/AdminClientComponent";
import { CreateClassRoom } from "@/components/forms/CreateClassRoom";
import {
  Classes,
  ClassRoom,
  Specialty,
  Subject,
  Teacher,
  Frame,
} from "@/types/databaseTypes";
import CreateClass from "@/components/forms/CreateClass";
import CreateSubject from "@/components/forms/CreateSubject";
import { ManageFormServerProps } from "@/types/FormActionType";
import CreateTeacher from "@/components/forms/CreateTeacher";
import { CreateFrame } from "@/components/forms/CreateFrame";
import { Entities } from "@/types/Entities";
import { getDbInstance } from "@/lib/database/db-instance";

export const TenancyBaseUrl = "";

async function getEntityFromDatabase<T>(id: number | null, label: Entities) {
  const db = await getDbInstance();
  const response = id ? await db.getOneEntityById<T>(id, label) : null;
  return response
    ? typeof response === "string"
      ? { error: response }
      : { entity: response }
    : null;
}

interface AdminPageProps {
  searchParams: { entity?: string; id?: string };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const auth = await getAuth();

  if (!auth || auth.userRole !== "admin") {
    redirect("/tenancy");
  }

  const resolvedSearchParams = await searchParams;
  const { entity, id } = resolvedSearchParams;

  const getContent = async () => {
    const contents = {
      [Entities.classroom]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<ClassRoom>(
          id,
          Entities.classroom
        );

        const serverProps: ManageFormServerProps = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update classroom" : "Create classroom",
          toastMessage: id
            ? "Classroom updated successfully"
            : "Classroom created successfully",
        };
        const title = id ? "Update classroom" : "Create classroom";

        return (
          <>
            <h2>{title}</h2>
            <CreateClassRoom
              {...serverProps}
              {...(entityToEdit ? entityToEdit : {})}
            />
          </>
        );
      },

      [Entities.class]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Classes>(
          id,
          Entities.class
        );

        const serverProps: ManageFormServerProps = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update class" : "Create class",
          toastMessage: id
            ? "Class updated successfully"
            : "Class created successfully",
        };
        const title = id ? "Update class" : "Create class";

        return (
          <>
            <h2>{title}</h2>
            <CreateClass
              {...(entityToEdit ? entityToEdit : {})}
              {...serverProps}
            />
          </>
        );
      },

      [Entities.specialty]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Specialty>(
          id,
          Entities.specialty
        );

        const serverProps: ManageFormServerProps = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update speciality" : "Create speciality",
          toastMessage: id
            ? "Speciality updated successfully"
            : "Speciality created successfully",
        };
        const title = id ? "Update speciality" : "Create speciality";

        return (
          <>
            <h2>{title}</h2>
            <CreateSpeciality
              {...(entityToEdit ? entityToEdit : {})}
              {...serverProps}
            />
          </>
        );
      },

      [Entities.subject]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Subject>(
          id,
          Entities.subject
        );

        const serverProps: ManageFormServerProps = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update subject" : "Create subject",
          toastMessage: id
            ? "Subject updated successfully"
            : "Subject created successfully",
        };

        const title = id ? "Update subject" : "Create subject";
        return (
          <>
            <h2>{title}</h2>
            <CreateSubject
              {...(entityToEdit ? entityToEdit : {})}
              {...serverProps}
            />
          </>
        );
      },
      [Entities.teacher]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Teacher>(
          id,
          Entities.teacher
        );

        const serverProps: ManageFormServerProps = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update teacher" : "Create teacher",
          toastMessage: id
            ? "Teacher updated successfully"
            : "Teacher created successfully",
        };

        const title = id ? "Update teacher" : "Create teacher";
        return (
          <>
            <h2>{title}</h2>
            <CreateTeacher
              {...(entityToEdit ? entityToEdit : {})}
              {...serverProps}
            />
          </>
        );
      },
      [Entities.frame]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Frame>(
          id,
          Entities.frame
        );

        const serverProps: ManageFormServerProps = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update frame" : "Create frame",
          toastMessage: id
            ? "Frame updated successfully"
            : "Frame created successfully",
        };

        const title = id ? "Update frame" : "Create frame";
        return (
          <>
            <h2>{title}</h2>
            <CreateFrame
              {...(entityToEdit ? entityToEdit : {})}
              {...serverProps}
            />
          </>
        );
      },
    };

    return entity && contents[entity as keyof typeof contents] ? (
      contents[entity as keyof typeof contents](id ? +id : null)
    ) : (
      <div>
        <h1>Admin Dashboard - Create New Entities</h1>
        <p>Select an entity to create:</p>
        <AdminClientComponent />
      </div>
    );
  };

  return <>{await getContent()}</>;
}
