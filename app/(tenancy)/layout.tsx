import { redirect } from "next/navigation";
import { getAuth } from "../api/auth/[...nextauth]/getAuth";
import { UserSession } from "@/types/UserTypes";
import { TenancyHeader } from "./TenancyHeader";

export default async function TenancyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: UserSession;
  try {
    session = await getAuth();
    if (!session || !session.userId || !session.tenancyId) {
      redirect("/login");
    }
  } catch (error) {
    redirect("/login");
  }

  return (
    <>
      <TenancyHeader />
      {children}
    </>
  );
}
