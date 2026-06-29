import SessionWrapper from "@/app/[locale]/SessionWrapper";
import { HeaderSearch } from "./HeaderSearch";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { getDbInstance } from "@/lib/database/db-instance";
import { GetTenancyByUserResult } from "@/types/databaseTypes";

export default async function HeaderWithSession() {
  const db = await getDbInstance();
  const session = await getAuth();
  let userTenancies: Array<GetTenancyByUserResult> = [];
  if (session && session.email) {
    try {
      userTenancies = await db.getTenanciesByUser(session.email);
    } catch (error) {
      console.error("Error fetching user tenancies:", error);
    }
  }

  return (
    <SessionWrapper>
      <HeaderSearch session={session} tenancies={userTenancies}/>
    </SessionWrapper>
  );
}
