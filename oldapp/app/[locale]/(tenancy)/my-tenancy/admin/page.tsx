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
import { ResultHandler } from "@/components/HOC/ResultErrorHandler";

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

async function safeGetAllEntity(db: any, label: Entities) {
  try {
    const data = await db.getAllEntity(label);
    return { data, error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
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

  const db = await getDbInstance();
  // Fetch entity counts for dashboard cards with error handling
  const [classroomsResult, classesResult, specialtiesResult, subjectsResult, teachersResult, framesResult] = await Promise.all([
    safeGetAllEntity(db, Entities.classroom),
    safeGetAllEntity(db, Entities.class),
    safeGetAllEntity(db, Entities.specialty),
    safeGetAllEntity(db, Entities.subject),
    safeGetAllEntity(db, Entities.teacher),
    safeGetAllEntity(db, Entities.frame),
  ]);

  // Collect all errors for toast display
  const allErrors = [
    classroomsResult.error,
    classesResult.error,
    specialtiesResult.error,
    subjectsResult.error,
    teachersResult.error,
    framesResult.error,
  ].filter(Boolean).join("; ") || null;

  const getContent = async () => {
    const contents = {
      [Entities.classroom]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<ClassRoom>(
          id,
          Entities.classroom
        );
        const serverProps: ManageFormServerProps & { formTitle: string } = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update classroom" : "Create classroom",
          toastMessage: id
            ? "Classroom updated successfully"
            : "Classroom created successfully",
          formTitle: id ? "Update classroom" : "Create classroom",
        };
        return (
          <CreateClassRoom
            {...serverProps}
            {...(entityToEdit ? entityToEdit : {})}
          />
        );
      },

      [Entities.class]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Classes>(
          id,
          Entities.class
        );

        const serverProps: ManageFormServerProps & { formTitle: string } = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update class" : "Create class",
          toastMessage: id
            ? "Class updated successfully"
            : "Class created successfully",
          formTitle: id ? "Update class" : "Create class",
        };
        return (
          <CreateClass
            {...(entityToEdit ? entityToEdit : {})}
            {...serverProps}
          />
        );
      },

      [Entities.specialty]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Specialty>(
          id,
          Entities.specialty
        );

        const serverProps: ManageFormServerProps & { formTitle: string } = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update speciality" : "Create speciality",
          toastMessage: id
            ? "Speciality updated successfully"
            : "Speciality created successfully",
          formTitle: id ? "Update speciality" : "Create speciality",
        };
        return (
          <CreateSpeciality
            {...serverProps}
            {...(entityToEdit ? entityToEdit : {})}
          />
        );
      },

      [Entities.subject]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Subject>(
          id,
          Entities.subject
        );

        const serverProps: ManageFormServerProps & { formTitle: string } = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update subject" : "Create subject",
          toastMessage: id
            ? "Subject updated successfully"
            : "Subject created successfully",
          formTitle: id ? "Update subject" : "Create subject",
        };

        return (
          <CreateSubject
            {...serverProps}
            {...(entityToEdit ? entityToEdit : {})}
          />
        );
      },
      [Entities.teacher]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Teacher>(
          id,
          Entities.teacher
        );

        const serverProps: ManageFormServerProps & { formTitle: string } = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update teacher" : "Create teacher",
          toastMessage: id
            ? "Teacher updated successfully"
            : "Teacher created successfully",
          formTitle: id ? "Update teacher" : "Create teacher",
        };

        return (
          <CreateTeacher
            {...serverProps}
            {...(entityToEdit ? entityToEdit : {})}
          />
        );
      },
      [Entities.frame]: async (id: number | null) => {
        const entityToEdit = await getEntityFromDatabase<Frame>(
          id,
          Entities.frame
        );

        const serverProps: ManageFormServerProps & { formTitle: string } = {
          backBtnUrl: id ? "/my-tenancy" : "/my-tenancy/admin",
          backBtnText: id ? "Go Back" : "Cancel",
          submitBtnText: id ? "Update frame" : "Create frame",
          toastMessage: id
            ? "Frame updated successfully"
            : "Frame created successfully",
          formTitle: id ? "Update frame" : "Create frame",
        };

        return (
          <CreateFrame
            {...serverProps}
            {...(entityToEdit ? entityToEdit : {})}
          />
        );
      },
    };

    return entity && contents[entity as keyof typeof contents] ? (
      contents[entity as keyof typeof contents](id ? +id : null)
    ) : (
      <ResultHandler error={allErrors}>
        <div>
          <h1>Admin Dashboard - Create New Entities</h1>
          <p>Select an entity to create:</p>
          <AdminClientComponent
            counts={{
              classroom: classroomsResult.data.length,
              class: classesResult.data.length,
              specialty: specialtiesResult.data.length,
              subject: subjectsResult.data.length,
              teacher: teachersResult.data.length,
              frame: framesResult.data.length,
            }}
          />
        </div>
      </ResultHandler>
    );
  };

  return <>{await getContent()}</>;
}
