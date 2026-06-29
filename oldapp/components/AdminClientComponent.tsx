"use client";

import { Button, Group, SimpleGrid } from "@mantine/core";
import { redirect } from "next/navigation";
import AdminEntityCard from "./AdminEntityCard";

interface AdminClientComponentProps {
  counts: {
    classroom: number;
    class: number;
    specialty: number;
    subject: number;
    teacher: number;
    frame: number;
  };
}

const entityData = [
  {
    key: "classroom",
    title: "Classrooms",
    description: "Manage all classrooms in your school.",
    createLabel: "Create a New Classroom",
    entity: "classroom",
  },
  {
    key: "class",
    title: "Classes",
    description: "Manage all student classes.",
    createLabel: "Create a New Class",
    entity: "class",
  },
  {
    key: "specialty",
    title: "Specialities",
    description: "Manage all specialities.",
    createLabel: "Create a New Speciality",
    entity: "specialty",
  },
  {
    key: "subject",
    title: "Subjects",
    description: "Manage all subjects.",
    createLabel: "Create a New Subject",
    entity: "subject",
  },
  {
    key: "teacher",
    title: "Teachers",
    description: "Manage all teachers.",
    createLabel: "Create a New Teacher",
    entity: "teacher",
  },
  {
    key: "frame",
    title: "Frames",
    description: "Manage all schedule frames.",
    createLabel: "Create a New Frame",
    entity: "frame",
  },
];

const AdminClientComponent = ({ counts }: AdminClientComponentProps) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {entityData.map((item) => (
        <AdminEntityCard
          key={item.key}
          title={item.title}
          description={item.description}
          count={typeof counts[item.key as keyof typeof counts] === "number" ? counts[item.key as keyof typeof counts] : null}
          createLabel={item.createLabel}
          onCreate={() => {
            window.location.href = `/my-tenancy/admin?entity=${item.entity}`;
          }}
        />
      ))}
    </SimpleGrid>
  );
};

export default AdminClientComponent;
