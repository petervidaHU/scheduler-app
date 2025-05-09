"use client";

import { Button } from "@mantine/core";
import { redirect } from "next/navigation";

const AdminClientComponent = () => {
  return (
    <>
      <Button onClick={() => redirect("/my-tenancy/admin?entity=classroom")}>
        Create a New Classroom
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?entity=class")}>
        Create a New Class
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?entity=specialty")}>
        Create a New Speciality
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?entity=subject")}>
        Create a New Subject
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?entity=teacher")}>
        Create a New Teacher
      </Button>
      <Button onClick={() => redirect("/my-tenancy/admin?entity=frame")}>
        Create a New Frame
      </Button>
    </>
  );
};

export default AdminClientComponent;
