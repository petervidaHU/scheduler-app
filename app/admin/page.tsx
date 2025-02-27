import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const session = useSession();

  if (!session?) {
    redirect("/signin");
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <form action={async () => {
        "use server";
        await signOut();
      }}>
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}