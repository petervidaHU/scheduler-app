"use server";

import { cache } from "react";
import { Roles } from "@/types/UserTypes";
import { getDbInstance } from "./database/db-instance";

export const getUserRole = cache(async function getUserRole(
  userId: string,
  tenancyId: string
): Promise<Roles | null> {
  try {
    const db = await getDbInstance();
    const role = await db.getUserRoleInTenancy(userId, tenancyId);
    return role ? role : null;
  } catch (error) {
    console.error(`Error getting user role: ${error}`);
    return null;
  }
});
