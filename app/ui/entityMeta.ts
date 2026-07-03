import type { Icon } from "@tabler/icons-react";
import {
  IconBook2,
  IconCertificate,
  IconClock,
  IconDoor,
  IconLayoutGrid,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

/**
 * Single source of truth for entity identity in the UI (UX-UI-principles §5.3).
 * Every badge, chip, icon tint, and planner accent for an entity type derives
 * from this map — never re-declare an entity color or icon inline.
 */
export type EntityKind =
  | "subject"
  | "teacher"
  | "class"
  | "classroom"
  | "specialty"
  | "frame"
  | "timeslot";

export type EntityMeta = {
  /** Mantine theme palette key (see app/theme.ts). */
  colorKey: string;
  icon: Icon;
  /** i18n key for the singular entity label. */
  labelKey: `entities.${EntityKind}`;
};

export const entityMeta: Record<EntityKind, EntityMeta> = {
  subject: { colorKey: "cambridge", icon: IconBook2, labelKey: "entities.subject" },
  teacher: { colorKey: "khaki", icon: IconUser, labelKey: "entities.teacher" },
  class: { colorKey: "tiffany", icon: IconUsersGroup, labelKey: "entities.class" },
  classroom: { colorKey: "taupe", icon: IconDoor, labelKey: "entities.classroom" },
  specialty: { colorKey: "cambridge", icon: IconCertificate, labelKey: "entities.specialty" },
  frame: { colorKey: "gray", icon: IconLayoutGrid, labelKey: "entities.frame" },
  timeslot: { colorKey: "gray", icon: IconClock, labelKey: "entities.timeslot" },
};
