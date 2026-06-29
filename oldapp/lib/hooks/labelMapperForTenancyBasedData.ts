import { Entities } from "@/types/Entities";

export const labelMapper: Partial<Record<Entities, any>> = {
  [Entities.specialty]: "specialties",
  [Entities.subject]: "subjects",
  [Entities.teacher]: "teachers",
  [Entities.classroom]: "classRooms",
  [Entities.class]: "classes",
  [Entities.frame]: "frames",
};