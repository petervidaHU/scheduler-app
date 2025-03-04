import SessionWrapper from "@/app/SessionWrapper";
import { HeaderSearch } from "./HeaderSearch";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";


export default async function HeaderWithSession() {
const session = await getAuth();

 
  return (
   <SessionWrapper>
    <HeaderSearch session={session} />
   </SessionWrapper>
  );
}