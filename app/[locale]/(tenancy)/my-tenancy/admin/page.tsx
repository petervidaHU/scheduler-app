import React from "react";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { redirect } from "next/navigation";
import CreateSpeciality from "@/components/forms/CreateSpeciality";
import AdminClientComponent from "@/components/AdminClientComponent";
import CreateClassRoom from "@/components/forms/CreateClassRoom";
import { Speciality, Subject } from "@/types/databaseTypes";
import db from "@/lib/database/db-instance";
import CreateClass from "@/components/forms/CreateClass";
import CreateSubject from "@/components/forms/CreateSubject";
import { SelectOptions } from "@/types/FormActionType";
import CreateTeacher from "@/components/forms/CreateTeacher";
import { Entities } from "@/types/Entities";

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
      [Entities.classroom]: async (id: string) => {
        let specialities: Speciality[] = [];
        try {
          const specials = await db.getAllSpeciality();
          if (specials.length > 0) {
            specialities.push(...specials);
          }
        } catch (error) {
          console.error("Error fetching specialities:", error);
        }
        return (
          <>
            <h2>Create new classroom</h2>
            <CreateClassRoom specialities={specialities} />
          </>
        );
      },
      [Entities.class]: async (id: string) => {
        let subjects: Subject[] = [];
        try {
          const subs = await db.getAllSubjects();
          if (subs.length > 0) {
            subjects.push(...subs);
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
        const subjectList: SelectOptions[] = subjects.map((s) => ({
          value: s.SUBJECT_ID.toString(),
          label: s.SUBJECT_NAME,
        }));

        let teachers: any[] = [];
        try {
          const tchs = await db.getAllTeachers();
          if (tchs.length > 0) {
            teachers.push(...tchs);
          }
        } catch (error) {
          console.error("Error fetching teachers:", error);
        }
        const teachersList: SelectOptions[] = teachers.map((t) => ({
          value: t.TEACHER_ID.toString(),
          label: t.TEACHER_NAME,
        }));

        return (
          <>
            <h2>Create new class</h2>
            <CreateClass
              subjectsList={subjectList}
              teachersList={teachersList}
            />
          </>
        );
      },
      [Entities.speciality]: async (id: string) => {
        let entityToEdit: {entity: Speciality} | null = null;
        if (id) {
          const res = await db.getSpecialityById(+id);
          entityToEdit = {entity: res};
        }
        return (
          <>
            <h2>Create new speciality</h2>
            <CreateSpeciality {...entityToEdit} />
          </>
        );
      },
      [Entities.subject]: async (id: string) => {
        let specialities: Speciality[] = [];
        try {
          const specials = await db.getAllSpeciality();
          if (specials.length > 0) {
            specialities.push(...specials);
          }
        } catch (error) {
          console.error("Error fetching specialities:", error);
        }
        return (
          <>
            <h2>Create new subject</h2>
            <CreateSubject specialities={specialities} />
          </>
        );
      },
      [Entities.teacher]: async (id: string) => {
        return (
          <>
            <h2>Create new teacher</h2>
            <CreateTeacher />
          </>
        );
      },
    };
    console.log("actionType", entity);

    return entity && contents[entity as keyof typeof contents] ? (
      contents[entity as keyof typeof contents](id || "")
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
