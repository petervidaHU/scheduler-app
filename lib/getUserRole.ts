"use server";

import { cache } from "react";
import { Roles } from "@/types/UserTypes";
import db from "@/lib/database/db-instance";

export const getUserRole = cache(async function getUserRole(
  userId: string,
  tenancyId: string
): Promise<Roles> {
  const role = await db.getUserRoleInTenancy(userId, tenancyId);
  if (!role) {
    throw new Error("User does not have a valid role");
  }
  return role;
});
