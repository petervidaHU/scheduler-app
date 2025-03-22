import { UserSession } from "@/types/UserTypes";
import { TenancyHeader } from "./TenancyHeader";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { redirect } from "@/lib/i18n/navigation";
import {getLocale} from 'next-intl/server';

export default async function TenancyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  let session: UserSession;
  try {
    session = await getAuth();
    if (!session || !session.userId || !session.tenancyId) {
      redirect({href: "/login", locale: locale });
    }
  } catch (error) {
    redirect({href: "/login", locale: locale });
  }

  return (
    <>
      <TenancyHeader />
      {children}
    </>
  );
}
