import SessionWrapper from "@/app/SessionWrapper";
import { HeaderSearch } from "./HeaderSearch";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import DatabaseService from "@/lib/database/db";

export default async function HeaderWithSession() {
  const db = new DatabaseService();
  const session = await getAuth();
  let userTenancies = [];
  if (session && session.email) {
    userTenancies = await db.getTenanciesByUser(session.email);
  }

  return (
    <SessionWrapper>
      <HeaderSearch session={session} tenancies={userTenancies}/>
    </SessionWrapper>
  );
}
