import { SimpleGrid } from "@mantine/core";
import AdminEntityCard, { type ResourcePluralLabelKey } from "./AdminEntityCard";
import type { EntityKind } from "~/ui";

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

const RESOURCE_CARDS: Array<{
  key: keyof AdminEntityCounts;
  kind: EntityKind;
  pluralLabelKey: ResourcePluralLabelKey;
}> = [
  { key: "classroom", kind: "classroom", pluralLabelKey: "nav.classrooms" },
  { key: "class", kind: "class", pluralLabelKey: "nav.classes" },
  { key: "specialty", kind: "specialty", pluralLabelKey: "nav.specialties" },
  { key: "subject", kind: "subject", pluralLabelKey: "nav.subjects" },
  { key: "teacher", kind: "teacher", pluralLabelKey: "nav.teachers" },
  { key: "frame", kind: "frame", pluralLabelKey: "nav.frames" },
];

export default function AdminClientComponent({ locale, counts }: AdminClientComponentProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {RESOURCE_CARDS.map((item) => (
        <AdminEntityCard
          key={item.key}
          kind={item.kind}
          pluralLabelKey={item.pluralLabelKey}
          count={counts[item.key]}
          createTo={`/${locale}/my-tenancy/admin/${item.key}/new`}
        />
      ))}
    </SimpleGrid>
  );
}
