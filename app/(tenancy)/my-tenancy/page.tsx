// app/(protected)/MyPage/page.tsx
import React from "react";
import { AdminContent } from "./AdminContent";
import { EditorContent } from "./EditorContent";
import { NoRoleContent } from "./NoRoleContent";
import { ReaderContent } from "./ReaderContent";
import { VisitorContent } from "./VisitorContent";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { Roles } from "@/types/UserTypes";

export default async function MyProtectedPage() {
  const {tenancyId, userRole} = await getAuth();
  const roleComponentMap: Record<Roles, React.ComponentType<{ tenancyId: string }>> = {
    norole: NoRoleContent,
    reader: ReaderContent,
    editor: EditorContent,
    admin: AdminContent,
    visitor: VisitorContent,
  };
  if (!userRole) {
    return <NoRoleContent tenancyId={tenancyId || ""} />;
  }

  const RoleBasedComponent = roleComponentMap[userRole];
  return (
    <div>
      <h1>My Protected Page</h1>
      {RoleBasedComponent ? (
        <RoleBasedComponent tenancyId={tenancyId || ""} />
      ) : (
        <NoRoleContent tenancyId={tenancyId || ""} />
      )}
    </div>
  );
}
