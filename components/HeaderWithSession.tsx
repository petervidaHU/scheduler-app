import SessionWrapper from "@/app/[locale]/SessionWrapper";
import { HeaderSearch } from "./HeaderSearch";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import db from "@/lib/database/bd-instance";

export default async function HeaderWithSession() {
  const session = await getAuth();
  let userTenancies = [];
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
