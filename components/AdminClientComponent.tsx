"use client";

import { Button } from "@mantine/core";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AdminClientComponent = () => {
  return (
    <>
      <Button onClick={() => redirect("/my-tenancy/admin?new=classroom")}>
        Create a New Classroom
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?new=class")}>
        Create a New Class
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?new=speciality")}>
        Create a New Speciality
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?new=subject")}>
        Create a New Subject
      </Button>
    </>
  );
};

export default AdminClientComponent;
