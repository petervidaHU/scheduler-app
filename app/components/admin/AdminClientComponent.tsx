import { SimpleGrid } from "@mantine/core";
import AdminEntityCard from "./AdminEntityCard";

export type AdminEntityCounts = {
  classroom: number;
  class: number;
  specialty: number;
  subject: number;
  teacher: number;
  frame: number;
};

type AdminClientComponentProps = {
  locale: string;
  counts: AdminEntityCounts;
};

const entityData: Array<{
  key: keyof AdminEntityCounts;
  title: string;
  description: string;
  createLabel: string;
  entity: string;
}> = [
  {
    key: "classroom",
    title: "Classrooms",
    description: "Manage all classrooms in your tenancy.",
    createLabel: "Create classroom",
    entity: "classroom",
  },
  {
    key: "class",
    title: "Classes",
    description: "Manage all student classes.",
    createLabel: "Create class",
    entity: "class",
  },
  {
    key: "specialty",
    title: "Specialties",
    description: "Manage specialization categories.",
    createLabel: "Create specialty",
    entity: "specialty",
  },
  {
    key: "subject",
    title: "Subjects",
    description: "Manage all subjects taught in this tenancy.",
    createLabel: "Create subject",
    entity: "subject",
  },
  {
    key: "teacher",
    title: "Teachers",
    description: "Manage teacher records and assignments.",
    createLabel: "Create teacher",
    entity: "teacher",
  },
  {
    key: "frame",
    title: "Frames",
    description: "Manage schedule frames and date ranges.",
    createLabel: "Create frame",
    entity: "frame",
  },
];

export default function AdminClientComponent({ locale, counts }: AdminClientComponentProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {entityData.map((item) => (
        <AdminEntityCard
          key={item.key}
          title={item.title}
          description={item.description}
          count={counts[item.key]}
          createLabel={item.createLabel}
          createTo={`/${locale}/my-tenancy/admin?entity=${item.entity}`}
        />
      ))}
    </SimpleGrid>
  );
}