import React from "react";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { redirect } from "next/navigation";
import CreateSpeciality from "@/components/forms/CreateSpeciality";
import AdminClientComponent from "@/components/AdminClientComponent";
import CreateClassRoom from "@/components/forms/CreateClassRoom";
import { Class, ClassRoom, Speciality, Subject } from "@/types/databaseTypes";
import db from "@/lib/database/bd-instance";
import CreateClass from "@/components/forms/CreateClass";
import CreateSubject from "@/components/forms/CreateSubject";
import { SelectOptions } from "@/types/FormActionType";
import CreateTeacher from "@/components/forms/CreateTeacher";

interface AdminPageProps {
  searchParams: { new?: string };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const auth = await getAuth();

  if (!auth || auth.userRole !== "admin") {
    redirect("/tenancy");
  }

  const resolvedSearchParams = await searchParams;
  const actionType = resolvedSearchParams.new;

  const getContent = async () => {
    const contents = {
      classroom: async () => {
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
      class: async () => {
        let subjects: Subject[] = [];
        try {
          const subs = await db.getAllSubjects();
          if (subs.length > 0) {
            subjects.push(...subs);
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
        const subjectList: SelectOptions[] = subjects.map(s => ({value: s.SUBJECT_ID.toString(), label: s.SUBJECT_NAME}))

        let teachers: any[] = [];
        try {
          const tchs = await db.getAllTeachers();
          if (tchs.length > 0) {
            teachers.push(...tchs);
          }
        } catch (error) {
          console.error("Error fetching teachers:", error);
        } 
        const teachersList: SelectOptions[] = teachers.map(t => ({value: t.TEACHER_ID.toString(), label: t.TEACHER_NAME}))

        return (
          <>
            <h2>Create new class</h2>
            <CreateClass subjectsList={subjectList} teachersList={teachersList}/>
          </>
        );
      },
      speciality: () => {
        return (
        <>
          <h2>Create new speciality</h2>
          <CreateSpeciality />
        </>
      )},
      subject: async () => { 
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
      )
    },
    teacher: async () => {
      return (
        <>
          <h2>Create new teacher</h2>
          <CreateTeacher />
        </>
      );
    },
    };

    return actionType && actionType in contents ? (
      contents[actionType as keyof typeof contents]()
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
